// game/scripts/src/modules/dealHandler.ts
import { getPlayerState, syncPlayerState } from "../state";
import { calculateBaseValue } from "../valuation";
import { releaseCounterAndAdvance } from "./queueManager";
import { checkQueueEmpty } from "./dayCycle";
import { getHeroRelation } from "../player_data";
import { getHeroState } from "./heroRegistry";
import { getItemDef } from "../items";
/** 档位配置（multiplier 是相对 accept 的系数） */
interface TierConfig {
    multiplier: number;
    rejectChance: number;
    reputationDelta: number;
}

const TIER_CONFIG: Record<string, TierConfig> = {
    'accept':   { multiplier: 1.0,   rejectChance: 0.0, reputationDelta: 0 },
    'haggle1':  { multiplier: 0.889, rejectChance: 0.3, reputationDelta: -1 },
    'haggle2':  { multiplier: 0.556, rejectChance: 0.7, reputationDelta: -3 },
    'overpay1': { multiplier: 1.333, rejectChance: 0.0, reputationDelta: 2 },
    'overpay2': { multiplier: 1.667, rejectChance: 0.0, reputationDelta: 5 },
};

/** 【新增】基础折扣 */
const BASE_DISCOUNT_SINGLE = 0.9;   // 单件
const BASE_DISCOUNT_ALL = 0.8;      // 全买

function findCustomerByUid(playerID: number, uid: string): CustomerInstance | undefined {
    const state = getPlayerState(playerID);
    return state.currentCustomerQueue.find(c => c.uid === uid);
}

/** 手动序列化 bag（服务端 Lua 没有 JSON.stringify） */
function serializeBag(bag: ItemInstance[]): string {
    const parts: string[] = [];
    for (let i = 0; i < bag.length; i++) {
        const item = bag[i];
        const def = getItemDef(item.defId);
        const type = def ? def.type : 'unknown';
        const identified = item.isIdentified ? 'true' : 'false';
        parts.push(`{"uid":"${item.uid}","defId":"${item.defId}","type":"${type}","condition":${item.condition},"isIdentified":${identified}}`);
    }
    return `[${parts.join(',')}]`;
}

/**
 * 处理玩家报价
 * 【新增】buyAll 参数：true 表示全买
 */
export function onPlayerOffer(event: {
    PlayerID: number;
    uid: string;
    tier: string;
    sellIndex: number;
    buyAll?: boolean;
}): void {
    const playerID = event.PlayerID;

    const customer = findCustomerByUid(playerID, event.uid);
    if (!customer) {
        print(`[暮色柜台] 找不到顾客：${event.uid}`);
        return;
    }

    const config = TIER_CONFIG[event.tier];
    if (!config) {
        print(`[暮色柜台] 未知档位：${event.tier}`);
        return;
    }

    const isBuyAll = event.buyAll === true;

    // ========== 全买模式 ==========
    if (isBuyAll) {
        if (customer.bag.length === 0) {
            print(`[暮色柜台] bag 已空，无法全买`);
            return;
        }

        // 算总估值
        let totalValue = 0;
        for (let i = 0; i < customer.bag.length; i++) {
            totalValue += calculateBaseValue(customer.bag[i]);
        }

        const price = Math.floor(totalValue * BASE_DISCOUNT_ALL * config.multiplier);

        // 掷骰
        const roll = RandomFloat(0, 1);
        const rejected = roll < config.rejectChance;

        print(`[全买] 档位=${event.tier} 总估值=${totalValue} 出价=${price} 被拒=${rejected}`);

        if (rejected) {
            CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
                playerID: playerID,
                uid: customer.uid,
                accepted: 0,
                tier: event.tier,
                rejectReason: '价格太低，顾客生气走了',
            });
            customer.state = 'leaving';
            leaveCustomer(playerID, customer);
            return;
        }

        // 现金检查
        const state = getPlayerState(playerID);
        if (state.cash < price) {
            CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
                playerID: playerID,
                uid: customer.uid,
                accepted: 0,
                tier: event.tier,
                rejectReason: `现金不足，还差 ${price - state.cash} 银`,
                softReject: 1,
            });
            return;
        }

        state.cash -= price;

        // 所有物品入库
        for (let i = 0; i < customer.bag.length; i++) {
            const item = customer.bag[i];
            const emptySlot = state.inventory.find(s => s.item === null);
            if (emptySlot) {
                emptySlot.item = item;
                emptySlot.count = 1;
            } else {
                state.inventory.push({ item: item, count: 1 });
            }
        }

        // 清空 bag
        customer.bag = [];

        // 好感度
        if (config.reputationDelta !== 0) {
            customer.reputationDelta = config.reputationDelta;
            const factionRel = state.factionRelations[customer.faction];
            factionRel.favor += config.reputationDelta;

            const heroRel = getHeroRelation(state, customer.defId);
            heroRel.favor += config.reputationDelta;
            heroRel.lastSeenDay = state.day;
            heroRel.tradeCount += 1;
            heroRel.totalTradeAmount += price;

            print(`[好感度] 全买 派系 ${customer.faction}：${factionRel.favor - config.reputationDelta} → ${factionRel.favor}`);
        }

        customer.state = 'done';
        syncPlayerState(playerID);

        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 1,
            finalPrice: price,
            tier: event.tier,
            reputationDelta: config.reputationDelta,
            remainingBag: '[]',
            allDone: 1,
        });

        leaveCustomer(playerID, customer);
        return;
    }

    // ========== 单件模式 ==========
    const item = customer.bag[event.sellIndex];
    if (!item) {
        print(`[暮色柜台] 无效 sellIndex：${event.sellIndex}`);
        return;
    }

    const baseValue = calculateBaseValue(item);
    const price = Math.floor(baseValue * BASE_DISCOUNT_SINGLE * config.multiplier);

    const roll = RandomFloat(0, 1);
    const rejected = roll < config.rejectChance;

    print(`[报价] 档位=${event.tier} sellIndex=${event.sellIndex} 估值=${baseValue} 出价=${price} 被拒=${rejected}`);

    if (rejected) {
        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 0,
            tier: event.tier,
            rejectReason: '价格太低，顾客生气走了',
        });
        customer.state = 'leaving';
        leaveCustomer(playerID, customer);
        return;
    }

    const state = getPlayerState(playerID);

    if (state.cash < price) {
        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 0,
            tier: event.tier,
            rejectReason: `现金不足，还差 ${price - state.cash} 银`,
            softReject: 1,
        });
        return;
    }

    state.cash -= price;

    // 入库
    const emptySlot = state.inventory.find(s => s.item === null);
    if (emptySlot) {
        emptySlot.item = item;
        emptySlot.count = 1;
    } else {
        state.inventory.push({ item: item, count: 1 });
    }

    // 从 bag 移除
    customer.bag.splice(event.sellIndex, 1);

    // 好感度
    if (config.reputationDelta !== 0) {
        customer.reputationDelta = config.reputationDelta;
        const factionRel = state.factionRelations[customer.faction];
        factionRel.favor += config.reputationDelta;

        const heroRel = getHeroRelation(state, customer.defId);
        heroRel.favor += config.reputationDelta;
        heroRel.lastSeenDay = state.day;
        heroRel.tradeCount += 1;
        heroRel.totalTradeAmount += price;

        print(`[好感度] 派系 ${customer.faction}：${factionRel.favor - config.reputationDelta} → ${factionRel.favor}`);
    }

    syncPlayerState(playerID);

    const allDone = customer.bag.length === 0;

    if (allDone) {
        customer.state = 'done';
        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 1,
            finalPrice: price,
            tier: event.tier,
            reputationDelta: config.reputationDelta,
            sellIndex: event.sellIndex,
            remainingBag: '[]',
            allDone: 1,
        });
        leaveCustomer(playerID, customer);
    } else {
        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 1,
            finalPrice: price,
            tier: event.tier,
            reputationDelta: config.reputationDelta,
            sellIndex: event.sellIndex,
            remainingBag: serializeBag(customer.bag),
            allDone: 0,
        });
    }
}

/** 拒绝顾客 */
export function onPlayerRefuse(event: { PlayerID: number; uid: string }): void {
    const playerID = event.PlayerID;
    const customer = findCustomerByUid(playerID, event.uid);
    if (!customer) return;

    CustomGameEventManager.Send_ServerToAllClients('tc_customer_left', {
        playerID: playerID,
        uid: customer.uid,
    });

    leaveCustomer(playerID, customer);
}

/** 结束交易 */
export function onEndTrade(event: { PlayerID: number; uid: string }): void {
    const playerID = event.PlayerID;
    const customer = findCustomerByUid(playerID, event.uid);
    if (!customer) return;

    CustomGameEventManager.Send_ServerToAllClients('tc_customer_left', {
        playerID: playerID,
        uid: customer.uid,
    });

    leaveCustomer(playerID, customer);
}

/**
 * 玩家卖东西给顾客
 */
export function onPlayerSell(event: { PlayerID: number; uid: string }): void {
    const playerID = event.PlayerID;

    const customer = findCustomerByUid(playerID, event.uid);
    if (!customer) {
        print(`[出售] 找不到顾客：${event.uid}`);
        return;
    }

    const buyReq = customer.buyRequest;
    if (!buyReq) {
        print(`[出售] 顾客没有购买需求`);
        return;
    }

    const state = getPlayerState(playerID);

    // 从库存找到该物品
    const slot = state.inventory.find(s => s.item?.uid === buyReq.itemUid);
    if (!slot || !slot.item) {
        print(`[出售] 库存里找不到物品：${buyReq.itemUid}`);
        CustomGameEventManager.Send_ServerToAllClients('tc_sell_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 0,
            reason: '物品已不在库存',
        });
        return;
    }

    // 【新增】检查顾客资金
    const heroState = getHeroState(customer.defId);
    if (!heroState) {
        CustomGameEventManager.Send_ServerToAllClients('tc_sell_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 0,
            reason: '顾客数据丢失',
        });
        return;
    }

    const price = buyReq.offerPrice;
    if (heroState.cash < price) {
        CustomGameEventManager.Send_ServerToAllClients('tc_sell_result', {
            playerID: playerID,
            uid: customer.uid,
            accepted: 0,
            reason: `顾客资金不足（还差 ${price - heroState.cash} 银）`,
        });
        return;
    }

    // 【新增】扣顾客钱
    const cashBefore = heroState.cash;
    heroState.cash -= price;
    print(`[出售] 顾客 ${customer.defId} 现金：${cashBefore} → ${heroState.cash}`);

    // 物品从库存移除
    slot.item = null;
    slot.count = 0;
    state.cash += price;

    // 好感度 +1
    const factionRel = state.factionRelations[customer.faction];
    if (factionRel) {
        factionRel.favor += 1;
        print(`[好感度] 卖出 派系 ${customer.faction}：${factionRel.favor - 1} → ${factionRel.favor}`);
    }

    const heroRel = getHeroRelation(state, customer.defId);
    heroRel.favor += 1;
    print(`[好感度] 卖出 英雄 ${customer.defId}：${heroRel.favor - 1} → ${heroRel.favor}`);

    // 清空购买需求
    customer.buyRequest = undefined;

    syncPlayerState(playerID);

    CustomGameEventManager.Send_ServerToAllClients('tc_sell_result', {
        playerID: playerID,
        uid: customer.uid,
        accepted: 1,
        price: price,
        itemDefId: buyReq.itemDefId,
    });

    print(`[出售] 玩家 ${playerID} 卖出 ${buyReq.itemDefId} 给 ${customer.uid}，价格 ${price}`);
}

/** 让顾客离开 */
function leaveCustomer(playerID: number, customer: CustomerInstance): void {
    customer.state = 'leaving';
    releaseCounterAndAdvance(playerID, customer.uid);

    const handle = EntIndexToHScript(customer.entityIndex) as CBaseEntity | undefined;
    if (handle && handle.IsBaseNPC()) {
        const npc: CDOTA_BaseNPC = handle;
        const spawnEnt = Entities.FindByName(null, 'tc_spawn_point');
        if (spawnEnt) {
            npc.MoveToPosition(spawnEnt.GetAbsOrigin());
        }
        Timers.CreateTimer(3, () => {
            if (npc) npc.RemoveSelf();

            const state = getPlayerState(playerID);
            const idx = state.currentCustomerQueue.findIndex(c => c.uid === customer.uid);
            if (idx >= 0) {
                state.currentCustomerQueue.splice(idx, 1);
            }
            checkQueueEmpty(playerID);
        });
    }
}