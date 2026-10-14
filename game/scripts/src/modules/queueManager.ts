// game/scripts/src/modules/queueManager.ts
import { getPlayerState } from "../state";

/**
 * 尝试让队列第一位顾客走向柜台
 * @param playerID 玩家 ID
 */
export function tryServeNextCustomer(playerID: number): void {
    const state = getPlayerState(playerID);

    // 柜台已占用，不推进
    if (state.counterOccupiedBy !== '') {
        return;
    }

    const queue = state.currentCustomerQueue;

    // 找第一个还没到柜台、还没完成的顾客
    const next = queue.find(c =>
        c.state !== 'atCounter' &&
        c.state !== 'negotiating' &&
        c.state !== 'done' &&
        c.state !== 'leaving'
    );
    if (!next) {
        return;
    }

    // 标记柜台占用
    state.counterOccupiedBy = next.uid;

    // 取柜台坐标
    const counterEnt = Entities.FindByName(null, 'tc_counter_point');
    if (!counterEnt) {
        print('[暮色柜台] 找不到 tc_counter_point');
        return;
    }
    const counterOrigin = counterEnt.GetAbsOrigin();

    const handle = EntIndexToHScript(next.entityIndex) as CBaseEntity | undefined;
    if (handle && handle.IsBaseNPC()) {
        const npc: CDOTA_BaseNPC = handle;
        npc.MoveToPosition(counterOrigin);
        next.state = 'walking';
        print(`[暮色柜台] 玩家 ${playerID} 下一位顾客走向柜台：${next.uid}`);
    }
}

/**
 * 顾客离开后释放柜台，推进下一位
 * @param playerID 玩家 ID
 * @param customerUid 离开的顾客 uid
 */
export function releaseCounterAndAdvance(playerID: number, customerUid: string): void {
    const state = getPlayerState(playerID);
    if (state.counterOccupiedBy === customerUid) {
        state.counterOccupiedBy = '';
    }
    tryServeNextCustomer(playerID);
}