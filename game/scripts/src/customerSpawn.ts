// game/scripts/src/modules/customerSpawn.ts
import { getPlayerState } from "./state";
import { startCustomerAI } from "./customerAI";
import { getItemDef } from "./items";
import { getFactionFromAttribute, Faction } from "./modules/factions";

/** 顾客模板定义 */
interface CustomerDef {
    heroName: string;
    displayName: string;
    personality: CustomerPersonality;
    faction: string;
    initialOfferItems: string[];
    buyInterest: string[];
}

const CUSTOMER_DEFS: CustomerDef[] = [
    { heroName: 'npc_dota_hero_axe', displayName: '斧王', personality: 'greedy', faction: 'orc', initialOfferItems: ['iron_sword', 'leather_vest'], buyInterest: ['weapon'] },
    { heroName: 'npc_dota_hero_crystal_maiden', displayName: '水晶室女', personality: 'cautious', faction: 'human', initialOfferItems: ['mana_crystal', 'scroll_of_wisdom'], buyInterest: ['accessory'] },
    { heroName: 'npc_dota_hero_windrunner', displayName: '风行者', personality: 'generous', faction: 'elf', initialOfferItems: ['enchanted_rapier'], buyInterest: ['armor'] },
    { heroName: 'npc_dota_hero_pudge', displayName: '帕吉', personality: 'desperate', faction: 'undead', initialOfferItems: ['dragonfang_dagger'], buyInterest: ['consumable'] },
];

/** 生成唯一 ID */
function genUID(prefix: string): string {
    return `${prefix}_${Time().toFixed(0)}_${RandomInt(10000, 99999)}`;
}

/** 按名字取 Hammer 实体坐标 */
function getEntityOrigin(name: string): Vector | undefined {
    const ent = Entities.FindByName(null, name);
    if (!ent) return undefined;
    return ent.GetAbsOrigin();
}

/** 随机取数组元素 */
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
    bag: ItemInstance[],
    buyInterest: string[],
    playerID: number,
    faction: Faction
): CustomerInstance {
    return {
        uid: genUID('cust'),
        defId: def.heroName,
        entityIndex: unit.entindex() as EntityIndex,
        playerID: playerID,
        faction: faction,
        state: 'walking',
        bag: bag,
        activeSellIndex: bag.length > 0 ? 0 : -1,
        buyInterest: buyInterest,
        offerPrice: 0,
        reputationDelta: 0,
    };
}

// ========== 主逻辑 ==========

export function spawnCustomers(playerID: number, count: number): void {
    const state = getPlayerState(playerID);

    print(`[入队] spawnCustomers 收到 playerID=${playerID}, count=${count}`);
    
    const spawnOrigin = getEntityOrigin('tc_spawn_point');
    const waitOrigin = getEntityOrigin('tc_wait_point');
    const counterOrigin = getEntityOrigin('tc_counter_point');
    if (!spawnOrigin || !waitOrigin || !counterOrigin) {
        print('[暮色柜台] 缺少 Hammer 实体：tc_spawn_point / tc_wait_point / tc_counter_point');
        return;
    }

    if (state.todaySpawned && state.currentCustomerQueue.length > 0) {
        print(`[顾客] 被 todaySpawned 挡掉：playerID=${playerID}`);
        return;
    }
    state.todaySpawned = true;

    for (let i = 0; i < count; i++) {
        const def = randomPick(CUSTOMER_DEFS);

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

        // 判断派系
        const attr = (unit as any).GetPrimaryAttribute();
        const faction = getFactionFromAttribute(attr);
        print(`[顾客] ${def.heroName} 主属性=${attr} 派系=${faction}`);
        // 生成 bag（现在只放 1 件，未来可以放多件）
        const bag: ItemInstance[] = [];
        const itemCount = RandomInt(1, 3);
        for (let j = 0; j < itemCount; j++) {
            const item = createSellItem(def);
            if (item) {
                bag.push(item);
            }
        }
        print(`[顾客] ${def.heroName} 携带 ${bag.length} 件物品`);
        // buyInterest 现在是数组，随机选 1 个
        const buyInterestList: string[] = [randomPick(def.buyInterest)];

        const instance = createCustomerInstance(def, unit, bag, buyInterestList, playerID, faction);

        Timers.CreateTimer(0.1, () => {
            if (unit) {
                print(`[暮色柜台] 顾客 ${instance.uid} 走向等待点`);
                unit.MoveToPosition(waitOrigin);
            }
        });
        state.currentCustomerQueue.push(instance);
        startCustomerAI(instance);
        // 【加日志】
        print(`[入队] playerID=${playerID}，顾客 uid=${instance.uid}，队列长度=${state.currentCustomerQueue.length}`);
    }


    
}

export function startWave(playerID: number, waveNumber: number): void {
    const baseCount = 3;
    const count = baseCount + waveNumber % 3;
    spawnCustomers(playerID, count);
}