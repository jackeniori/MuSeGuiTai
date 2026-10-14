// game/scripts/src/modules/factions.ts

/** 4 个派系 */
export type Faction = 'strength' | 'intelligence' | 'agility' | 'universal';

/** 所有派系列表 */
export const ALL_FACTIONS: Faction[] = ['strength', 'intelligence', 'agility', 'universal'];

/** 派系中文名 */
export const FACTION_NAMES: Record<Faction, string> = {
    'strength': '力量',
    'intelligence': '智力',
    'agility': '敏捷',
    'universal': '全才',
};

/** 根据英雄主属性判断派系 */
export function getFactionFromAttribute(attr: number): Faction {
    // DOTA_ATTRIBUTE_STRENGTH = 0
    // DOTA_ATTRIBUTE_AGILITY = 1
    // DOTA_ATTRIBUTE_INTELLECT = 2
    // DOTA_ATTRIBUTE_UNIVERSAL = 3
    if (attr === 0) return 'strength';
    if (attr === 1) return 'agility';
    if (attr === 2) return 'intelligence';
    return 'universal';
}