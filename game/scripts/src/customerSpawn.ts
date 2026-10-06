import { getState, setPhase,isTodaySpawned,setTodaySpawned } from "./state";
import { startCustomerAI } from "./customerAI";
import { getItemDef, getItemDefsByType } from "./items";
import { tryServeNextCustomer } from "./modules/queueManager";
const CUSTOMER_DEFS: CustomerDef[] = [
  { heroName: 'npc_dota_hero_axe', displayName: '斧王', personality: 'greedy', faction: 'orc', initialOfferItems: ['iron_sword', 'leather_vest'], buyInterest: ['weapon'] },
  { heroName: 'npc_dota_hero_crystal_maiden', displayName: '水晶室女', personality: 'cautious', faction: 'human', initialOfferItems: ['mana_crystal', 'scroll_of_wisdom'], buyInterest: ['accessory'] },
  { heroName: 'npc_dota_hero_windrunner', displayName: '风行者', personality: 'generous', faction: 'elf', initialOfferItems: ['enchanted_rapier'], buyInterest: ['armor'] },
  { heroName: 'npc_dota_hero_pudge', displayName: '帕吉', personality: 'desperate', faction: 'undead', initialOfferItems: ['dragonfang_dagger'], buyInterest: ['consumable'] },
  // 可继续添加...
];

/** 生成唯一 ID（Dota2 Lua 环境安全，替代 Date.now + Math.random） */
function genUID(prefix: string): string {
    return `${prefix}_${Time().toFixed(0)}_${RandomInt(10000, 99999)}`;
}

/** 按名字取 Hammer 实体坐标，找不到返回 undefined */
function getEntityOrigin(name: string): Vector | undefined {
    const ent = Entities.FindByName(null, name);
    if (!ent) return undefined;
    return ent.GetAbsOrigin();
}

/** 随机从数组里取一个元素 */
function randomPick<T>(arr: T[]): T {
    return arr[RandomInt(0, arr.length - 1)];
}

/** 生成顾客要卖的物品实例 */
function createSellItem(def: CustomerDef): ItemInstance | undefined {
    const itemDefId = randomPick(def.initialOfferItems);
    const itemDef = getItemDef(itemDefId);
    if (!itemDef) return undefined;
    return {
        uid: genUID('item'),
        defId: itemDefId,
        condition: RandomFloat(itemDef.minCondition, itemDef.maxCondition),
        isIdentified: false,
    };
}

/** 构造顾客实例 */
function createCustomerInstance(
    def: CustomerDef,
    unit: CDOTA_BaseNPC,
    sellItem: ItemInstance | undefined,
    buyInterest: string
): CustomerInstance {
    return {
        uid: genUID('cust'),
        defId: def.heroName,
        entityIndex: unit.entindex() as EntityIndex,
        state: 'walking',
        currentItemForSale: sellItem,
        buyInterest: buyInterest,
        offerPrice: 0,
        reputationDelta: 0,
    };
}

// ========== 主逻辑 ==========

/**
 * 生成指定数量的顾客，全部先站到等待点
 */
export function spawnCustomers(count: number): void {
    // 取三个 Hammer 实体坐标
    const spawnOrigin = getEntityOrigin('tc_spawn_point');
    const waitOrigin = getEntityOrigin('tc_wait_point');
    const counterOrigin = getEntityOrigin('tc_counter_point');
    if (!spawnOrigin || !waitOrigin || !counterOrigin) {
        print('[暮色柜台] 缺少 Hammer 实体：tc_spawn_point / tc_wait_point / tc_counter_point');
        return;
    }
    // 【新增】如果今天已经生成过，且队列还有顾客，就不再生成
    if (isTodaySpawned() && getState().currentCustomerQueue.length > 0) {
        return;
    }
    setTodaySpawned(true);
    for (let i = 0; i < count; i++) {
        const def = randomPick(CUSTOMER_DEFS);

        // 创建单位
        const unit = CreateUnitByName(
            def.heroName,
            spawnOrigin,
            true,
            undefined,
            undefined,
            DotaTeam.GOODGUYS
        );
        if (!unit) {
            print(`[暮色柜台] 创建顾客失败：${def.heroName}`);
            continue;
        }

        // 构造顾客数据
        const sellItem = createSellItem(def);
        const buyInterest = randomPick(def.buyInterest);
        const instance = createCustomerInstance(def, unit, sellItem, buyInterest);

        // 延迟一帧，走向等待点（不是柜台）
        Timers.CreateTimer(0.1, () => {
            if (unit) {
                print(`[暮色柜台] 顾客 ${instance.uid} 走向等待点`);
                unit.MoveToPosition(waitOrigin);
            }
        });

        // 入队 + 启动 AI
        getState().currentCustomerQueue.push(instance);
        startCustomerAI(instance);
    }

}

/**
 * 开始一波顾客
 */
export function startWave(waveNumber: number): void {
    const baseCount = 3;
    const count = baseCount + waveNumber % 3;
    spawnCustomers(count);
}
