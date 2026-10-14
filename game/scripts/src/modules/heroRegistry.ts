// game/scripts/src/modules/heroRegistry.ts
import { Faction } from "./factions";

/** 【不变】英雄的基础档案 */
export interface HeroProfile {
    heroName: string;
    displayName: string;
    faction: Faction;
    basePriceModifier: number;
}

/** 【可变】英雄的运行时状态（全局） */
export interface HeroState {
    heroName: string;
    cash: number;
    level: number;
    equipment: ItemInstance[];
    bag: ItemInstance[];
    hiredBy: number;           // -1 = 空闲，其他 = 被哪个玩家雇佣
    hireExpireDay: number;     // 到期天数
    unlocked: boolean;
}

/** 全局数据 */
const heroProfiles: Record<string, HeroProfile> = {};
const heroStates: Record<string, HeroState> = {};

/** 初始化所有英雄 */
export function initHeroRegistry(): void {
    // 【示例】手动列举，也可以从 KV 读
    const heroList: { heroName: string; displayName: string; faction: Faction }[] = [
        { heroName: 'npc_dota_hero_axe', displayName: '斧王', faction: 'strength' },
        { heroName: 'npc_dota_hero_sven', displayName: '斯温', faction: 'strength' },
        { heroName: 'npc_dota_hero_crystal_maiden', displayName: '水晶室女', faction: 'intelligence' },
        { heroName: 'npc_dota_hero_lina', displayName: '莉娜', faction: 'intelligence' },
        { heroName: 'npc_dota_hero_antimage', displayName: '敌法师', faction: 'agility' },
        { heroName: 'npc_dota_hero_juggernaut', displayName: '剑圣', faction: 'agility' },
        { heroName: 'npc_dota_hero_windrunner', displayName: '风行者', faction: 'universal' },
        // ... 全部英雄
    ];

    for (const h of heroList) {
        heroProfiles[h.heroName] = {
            heroName: h.heroName,
            displayName: h.displayName,
            faction: h.faction,
            basePriceModifier: 1.0,
        };
        heroStates[h.heroName] = {
            heroName: h.heroName,
            cash: RandomInt(10000, 50000),
            level: 1,
            equipment: [],
            bag: [],
            hiredBy: -1,
            hireExpireDay: 0,
            unlocked: true,
        };
    }

    print(`[英雄注册表] 初始化了 ${Object.keys(heroProfiles).length} 个英雄`);
}

export function getHeroProfile(heroName: string): HeroProfile | undefined {
    return heroProfiles[heroName];
}

export function getHeroState(heroName: string): HeroState | undefined {
    return heroStates[heroName];
}

export function getAllHeroStates(): Record<string, HeroState> {
    return heroStates;
}

/** 直接替换某个英雄的状态（用于存档读档） */
export function setHeroState(heroName: string, state: HeroState): void {
    heroStates[heroName] = state;
}

/** 【关键】雇佣：全局独占锁 */
export function hireHero(heroName: string, playerID: number, days: number, currentDay: number): boolean {
    const state = heroStates[heroName];
    if (!state) return false;

    // 已被别人雇佣
    if (state.hiredBy !== -1 && state.hiredBy !== playerID) {
        print(`[雇佣] ${heroName} 已被玩家 ${state.hiredBy} 雇佣`);
        return false;
    }

    state.hiredBy = playerID;
    state.hireExpireDay = currentDay + days;
    print(`[雇佣] 玩家 ${playerID} 雇佣了 ${heroName}，到期第 ${state.hireExpireDay} 天`);
    return true;
}

/** 解雇 */
export function fireHero(heroName: string, playerID: number): boolean {
    const state = heroStates[heroName];
    if (!state) return false;
    if (state.hiredBy !== playerID) return false;

    state.hiredBy = -1;
    state.hireExpireDay = 0;
    print(`[雇佣] 玩家 ${playerID} 解雇了 ${heroName}`);
    return true;
}

/** 每天检查雇佣到期 */
export function checkHireExpiration(currentDay: number): void {
    for (const heroName in heroStates) {
        const state = heroStates[heroName];
        if (state.hiredBy !== -1 && state.hireExpireDay <= currentDay) {
            print(`[雇佣] ${heroName} 与玩家 ${state.hiredBy} 的合约到期`);
            state.hiredBy = -1;
            state.hireExpireDay = 0;
        }
    }
}

/** 判断某英雄是否空闲 */
export function isHeroFree(heroName: string): boolean {
    const state = heroStates[heroName];
    return state ? state.hiredBy === -1 : false;
}