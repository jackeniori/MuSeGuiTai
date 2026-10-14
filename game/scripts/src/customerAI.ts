// game/scripts/src/modules/customerAI.ts
import { getPlayerState } from "./state";
import { tryServeNextCustomer } from "./modules/queueManager";
import { calculateBaseValue } from "./valuation";
import { getItemDef } from "./items";
import { getHeroState } from "./modules/heroRegistry";
/** 计算两点二维距离 */
function dist2D(a: Vector, b: Vector): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/** 序列化函数 */
function serializeBag(bag: ItemInstance[]): string {
    const parts: string[] = [];
    for (let i = 0; i < bag.length; i++) {
        const item = bag[i];
        const def = getItemDef(item.defId);
        const type = def ? def.type : 'unknown';       // 从 ItemDef 取 type
        const price = calculateBaseValue(item); 
        const identified = item.isIdentified ? 'true' : 'false';
        parts.push(`{"uid":"${item.uid}","defId":"${item.defId}","type":"${type}","condition":${item.condition},"price":${price},"isIdentified":${identified}}`);
    
    }
    return `[${parts.join(',')}]`;
}

export function startCustomerAI(customer: CustomerInstance): void {
    Timers.CreateTimer((): number | undefined => {
        // 已离开或已完成，停止定时器
        if (customer.state === 'leaving' || customer.state === 'done') return;

        // 取实体句柄
        const handle = EntIndexToHScript(customer.entityIndex) as CBaseEntity | undefined;
        if (!handle || !handle.IsBaseNPC()) {
            return 0.25;   // 【修改】实体无效时继续重试，不是 -1
        }
        const npc: CDOTA_BaseNPC = handle;
        const origin: Vector = npc.GetOrigin();

        switch (customer.state) {
        case 'walking': {
            const counterEnt = Entities.FindByName(null, 'tc_counter_point');
            if (counterEnt) {
                const counterPos = counterEnt.GetAbsOrigin();
                if (dist2D(origin, counterPos) < 64) {
                    customer.state = 'atCounter';

                    const item = customer.bag[0];
                    let customerOffer = 0;
                    if (item) {
                        const baseValue = calculateBaseValue(item);
                        customerOffer = Math.floor(baseValue * 0.9);
                    }
                    customer.offerPrice = customerOffer;
                    customer.activeSellIndex = 0;

                    const buyInterestStr = customer.buyInterest[0] ?? '';
                    const bagJson = serializeBag(customer.bag);

                    //读顾客资金
                    const heroState = getHeroState(customer.defId);
                    const customerCash = heroState ? heroState.cash : 0;
                    print(`[购买匹配] 顾客 ${customer.defId}，heroState.cash=${heroState?.cash}，customerCash=${customerCash}`);


                    // 从玩家库存匹配 buyInterest 类别，且顾客买得起
                    const state = getPlayerState(customer.playerID);
                    let buyItemUid = '';
                    let buyItemDefId = '';
                    let buyItemCondition = 0;
                    let buyOfferPrice = 0;
                    print(`[购买匹配] 库存物品数=${state.inventory.length}`);
                    for (let i = 0; i < state.inventory.length; i++) {
                        const slot = state.inventory[i];
                        if (!slot.item) continue;

                        const def = getItemDef(slot.item.defId);
                        if (!def) continue;
                        const baseValue = calculateBaseValue(slot.item);
                        const offer = Math.floor(baseValue * 0.7);
                        const match = customer.buyInterest.indexOf(def.type) >= 0;
                        const afford = offer <= customerCash;
                        print(`[购买匹配] 槽位${i}: ${slot.item.defId} type=${def.type} offer=${offer} 匹配=${match} 买得起=${afford}`);

                        // 匹配类别
                        if (customer.buyInterest.indexOf(def.type) >= 0) {
                            const baseValue = calculateBaseValue(slot.item);
                            const offer = Math.floor(baseValue * 0.7);

                            // 【新增】检查顾客资金够不够
                            if (offer > customerCash) {
                                print(`[购买] 顾客买不起 ${slot.item.defId}（需要 ${offer}，只有 ${customerCash}）`);
                                continue;
                            }

                            buyItemUid = slot.item.uid;
                            buyItemDefId = slot.item.defId;
                            buyItemCondition = slot.item.condition;
                            buyOfferPrice = offer;
                            print(`[购买] 顾客 ${customer.uid} 想买 ${buyItemDefId}，出价 ${buyOfferPrice}`);
                            break;
                        }
                    }

                    // 存到 customer
                    if (buyItemUid) {
                        customer.buyRequest = {
                            itemUid: buyItemUid,
                            itemDefId: buyItemDefId,
                            offerPrice: buyOfferPrice,
                        };
                    } else {
                        customer.buyRequest = undefined;
                    }

                    CustomGameEventManager.Send_ServerToAllClients('tc_customer_arrived', {
                        playerID: customer.playerID,
                        uid: customer.uid,
                        defId: customer.defId,
                        itemDefId: item?.defId ?? '',
                        condition: item?.condition ?? 0,
                        isIdentified: item?.isIdentified ? 1 : 0,
                        buyInterest: buyInterestStr,
                        offerPrice: customerOffer,
                        bagList: bagJson,
                        buyItemUid: buyItemUid,
                        buyItemDefId: buyItemDefId,
                        buyItemCondition: buyItemCondition,
                        buyOfferPrice: buyOfferPrice,
                        customerCash: customerCash,   // 【新增】
                    });
                    break;
                }
            }

                // 2. 判断是否到达等待区
                const waitEnt = Entities.FindByName(null, 'tc_wait_point');
                if (waitEnt) {
                    const waitPos = waitEnt.GetAbsOrigin();
                    if (dist2D(origin, waitPos) < 100) {
                        // 【修改】用 customer 的字段，不用 as any
                        if (!customer.hasTriedQueue) {
                            customer.hasTriedQueue = true;
                            print(`[暮色柜台] 顾客 ${customer.uid} 到达等待区，尝试推进队列`);
                            tryServeNextCustomer(customer.playerID);   // 【修改】传 playerID
                        }
                    }
                }
                break;
            }

            case 'atCounter':
                break;

            case 'negotiating':
                break;

            default:
                break;
        }

        return 0.25;
    });
}

/**
 * 【修改】玩家响应（成交/拒绝）
 * 这里不需要单独处理 playerID，因为玩家的事件回调会直接调 dealHandler
 * 如果保留这个函数，改法如下
 */
export function onPlayerRespond(
    playerID: number,
    customerUid: string,
    accepted: boolean
): void {
    const state = getPlayerState(playerID);   // 【修改】
    const cust = state.currentCustomerQueue.find(c => c.uid === customerUid);
    if (!cust) return;

    if (accepted) {
        cust.state = 'done';
    } else {
        cust.state = 'leaving';
        const handle = EntIndexToHScript(cust.entityIndex) as CBaseEntity | undefined;
        if (handle && handle.IsBaseNPC()) {
            const npc: CDOTA_BaseNPC = handle;
            npc.MoveToPosition(Vector(-200, 0, 128));
        }
    }
}