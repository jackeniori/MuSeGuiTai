
import { getState } from "../state";
import { calculateBaseValue } from "../valuation";
import { releaseCounterAndAdvance } from "./queueManager";
import { checkQueueEmpty } from "./queueManager";
/** 根据 uid 从队列里找顾客 */
function findCustomerByUid(uid: string): CustomerInstance | undefined {
    return getState().currentCustomerQueue.find(c => c.uid === uid);
}

interface NegotiateResult {
    accepted: boolean;
    finalPrice: number;
    counterOffer?: number;   // 拒绝时的还价
}
function negotiate(
    playerOffer: number,
    itemValue: number,
    defId: string
): NegotiateResult {
    // 简单逻辑：出价 >= 估值 80% 就成交，否则还价
    const minAccept = itemValue * 0.8;
    if (playerOffer >= minAccept) {
        return { accepted: true, finalPrice: playerOffer };
    }
    return {
        accepted: false,
        finalPrice: 0,
        counterOffer: Math.floor(minAccept),
    };
}

/** 处理玩家报价 */
export function onPlayerOffer(event: { PlayerID: number; uid: string; price: number }): void {
    const customer = findCustomerByUid(event.uid);
    if (!customer) {
        print(`[暮色柜台] 找不到顾客：${event.uid}`);
        return;
    }

    const item = customer.currentItemForSale;
    if (!item) {
        print(`[暮色柜台] 顾客没有要卖的物品`);
        return;
    }

    // 计算物品估值
    const baseValue: number = calculateBaseValue(item);
    // 谈判判断
    const result = negotiate(event.price, baseValue, customer.defId);
    print(`[2] 估值=${baseValue} 出价=${event.price} accepted=${result.accepted} counter=${result.counterOffer}`);
    if (result.accepted) {
        const state = getState();
        state.cash -= result.finalPrice;

        // 找空格子放物品
        const emptySlot = state.inventory.find(slot => slot.item === null);
        if (emptySlot) {
            emptySlot.item = item;
            emptySlot.count = 1;
        } else {
            state.inventory.push({ item: item, count: 1 });
        }

        customer.state = 'done';
        customer.offerPrice = result.finalPrice;

        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            uid: customer.uid,
            accepted: true,
            finalPrice: result.finalPrice,
        });

        leaveCustomer(customer);
    } else {
        CustomGameEventManager.Send_ServerToAllClients('tc_deal_result', {
            uid: customer.uid,
            accepted: false,
            counterOffer: result.counterOffer ?? 0,
        });
    }
}

/** 让顾客离开 */
function leaveCustomer(customer: CustomerInstance): void {
    customer.state = 'leaving';

        // 释放柜台，推进下一位
    releaseCounterAndAdvance(customer.uid);

    const handle = EntIndexToHScript(customer.entityIndex) as CBaseEntity | undefined;
    if (handle && handle.IsBaseNPC()) {
        const npc: CDOTA_BaseNPC = handle;
        const spawnEnt = Entities.FindByName(null, 'tc_spawn_point');
        if (spawnEnt) {
            npc.MoveToPosition(spawnEnt.GetAbsOrigin());
        }
        Timers.CreateTimer(3, () => {
            if (npc) {
                npc.RemoveSelf();
            }
            const state = getState();
            const idx = state.currentCustomerQueue.findIndex(c => c.uid === customer.uid);
            if (idx >= 0) {
                state.currentCustomerQueue.splice(idx, 1);
            }
            // 【新增】检查队列是否空
            checkQueueEmpty();
        });
    }
}

