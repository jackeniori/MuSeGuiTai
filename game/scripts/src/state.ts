

//import { initInventory } from "./inventory";
/** 库存格子 */
export interface ItemSlot {
    item: ItemInstance | null;   // null 表示空格
    count: number;               // 堆叠数量
}

interface  GameState {
    day: number;
    phase: 'morning' | 'afternoon' | 'evening' | 'night' | 'deepNight';
    cash: number;
    rent: number;              // 每日房租
    reputation: Record<string, number>;  // 派系好感度
    inventory?: ItemSlot []
    displayCase: (ItemInstance | null)[]; // 展示柜格子，固定长度（例如6格），null表示空格
    employees: Employee[];
    currentCustomerQueue: CustomerInstance[];
    events?:  {
        id?: string;
        type?: 'raid' | 'smuggle' | 'dispute' | 'investigation';
        difficulty?: number;
        description?: string;
        assignedEmployeeIds?: string[];
        resolved?: boolean;
    };
}
let state: GameState = {
  day: 1,
  phase: 'morning',
  cash: 500,
  rent: 100,  
  reputation: {},
  inventory: [],
  displayCase: [], // 展示柜格子，固定长度（例如6格），null表示空格
  employees: [],
  currentCustomerQueue: [],
  //events: []
};

// 存档键名
const SAVE_KEY = 'twilight_state';

export function saveGame(): void {
  // 使用 CustomNetTables 或本地文件存储
  // 这里用简单的全局变量模拟
  print("Saving game...");
  // 实际可调用 CustomNetTables.SetTableValue('twilight', 'state', state)
}

export function loadGame(): boolean {
  // 尝试读取存档
  return false; // 无存档则返回false
}

export function getState(): GameState {
  return state;
}

export function setPhase(phase: GameState['phase']): void {
  state.phase = phase;
}

export function modifyCash(delta: number): void {
  state.cash += delta;
  if (state.cash < 0) state.cash = 0;
}

export function endDay(): void {
    const state = getState();

    // 扣房租
    state.cash -= state.rent;
    print(`[暮色柜台] 第 ${state.day} 天结束，扣房租 ${state.rent}，剩余现金 ${state.cash}`);

    // 天数 +1
    state.day += 1;
    // 房租随天数上涨，每天 +10
    state.rent = 100 + (state.day - 1) * 10;
    // 时段重置
    state.phase = 'morning';

    // 清空队列
    state.currentCustomerQueue = [];

    // 重置“今日已生成”标记
    setTodaySpawned(false);

    print(`[暮色柜台] 第 ${state.day} 天开始，现金 ${state.cash}，房租 ${state.rent}`);
}

let counterOccupiedBy: string = '';

export function getCounterOccupiedBy(): string {
    return counterOccupiedBy;
}

export function setCounterOccupiedBy(uid: string): void {
    counterOccupiedBy = uid;
}

let todaySpawned: boolean = false;

export function isTodaySpawned(): boolean {
    return todaySpawned;
}

export function setTodaySpawned(v: boolean): void {
    todaySpawned = v;
}


// 初始化
//initInventory();