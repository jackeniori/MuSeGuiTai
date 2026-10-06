// game/scripts/src/modules/queueManager.ts
// 【新建】队列管理：决定谁去柜台

import { getState, endDay,getCounterOccupiedBy, isTodaySpawned,setTodaySpawned,setCounterOccupiedBy } from "../state";
import { spawnCustomers } from "../customerSpawn";
/** 【新增】尝试让队列第一位顾客走向柜台 */
export function tryServeNextCustomer(): void {
    // 柜台已占用，不推进
    if (getCounterOccupiedBy() !== '') {
        return;
    }

    const state = getState();
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
    setCounterOccupiedBy(next.uid);

    // 取柜台坐标，命令单位走过去
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
        print(`[暮色柜台] 下一位顾客走向柜台：${next.uid}`);
    }
}

/** 【新增】顾客离开后释放柜台，推进下一位 */
export function releaseCounterAndAdvance(customerUid: string): void {
    if (getCounterOccupiedBy() === customerUid) {
        setCounterOccupiedBy('');
    }
    tryServeNextCustomer();
}

/** 【新增】检查队列是否空，空了就结束一天 */
export function checkQueueEmpty(): void {
    const state = getState();

    // 队列里还有顾客，不结束
    if (state.currentCustomerQueue.length > 0) {
        return;
    }

    // 已经触发过结束，不重复触发
    if (isTodaySpawned()) {
        return;
    }
    setTodaySpawned(true);

    // 结束一天
    endDay();

    // 延时 2 秒，生成新一天顾客（让玩家有个缓冲）
    Timers.CreateTimer(2, () => {
        const count = 3 + RandomInt(0, 2);   // 每天 3~5 个顾客
        spawnCustomers(count);
    });
}