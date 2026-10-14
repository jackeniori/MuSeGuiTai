// game/scripts/src/modules/dayCycle.ts
import { getPlayerState,syncPlayerState } from "../state";
import { spawnCustomers } from "../customerSpawn";

/**
 * 结束一天，进入第二天
 * @param playerID 玩家 ID
 */
export function endDay(playerID: number): void {
    const state = getPlayerState(playerID);

    print(`[日循环] 玩家 ${playerID} endDay 触发：第 ${state.day} 天结束，现金 ${state.cash}`);
    
    state.cash -= state.rent;
    state.day += 1;
    state.phase = 'morning';
    state.currentCustomerQueue = [];

    // 重置两个标记
    state.todaySpawned = false;
    state.dayEnded = false;
    syncPlayerState(playerID);
    print(`[日循环] 玩家 ${playerID} 进入第 ${state.day} 天，现金 ${state.cash}`);
}

/**
 * 检查队列是否空，空了就结束一天并开始新一天
 * @param playerID 玩家 ID
 */
export function checkQueueEmpty(playerID: number): void {
    const state = getPlayerState(playerID);

    print(`[日循环] checkQueueEmpty：玩家 ${playerID}，队列剩余 ${state.currentCustomerQueue.length} 人，dayEnded=${state.dayEnded}`);  

    // 队列还有顾客，不结算
    if (state.currentCustomerQueue.length > 0) {
        print(`[日循环] 玩家 ${playerID} 队列还有顾客，不结算`);
        return;
    }

    // 已结算过，跳过
    if (state.dayEnded) {
        print(`[日循环] 玩家 ${playerID} 今天已结算过，跳过`);
        return;
    }
    state.dayEnded = true;
    
    print(`[日循环] 玩家 ${playerID} 队列空，开始结算`);
    endDay(playerID);

    Timers.CreateTimer(2, () => {
        const count = 3 + RandomInt(0, 2);
        print(`[日循环] 玩家 ${playerID} 生成明天顾客：${count} 人`);
        spawnCustomers(playerID, count);
    });
}