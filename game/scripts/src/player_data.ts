
// game/scripts/src/player_data.ts
import { Faction, ALL_FACTIONS } from "./modules/factions";

/** 【玩家私有】玩家和某个英雄的关系 */
export interface HeroRelation {
    favor: number;
    unlocked: boolean;
    tags: string[];
    lastSeenDay: number;
    tradeCount: number;
    totalTradeAmount: number;
}

/** 【玩家私有】玩家和某个派系的关系 */
export interface FactionRelation {
    favor: number;
    level: number;
    unlocked: boolean;
}

export interface PlayerData {
    playerID: number;
    day: number;
    phase: 'morning' | 'afternoon' | 'evening' | 'night' | 'deepNight';
    cash: number;
    rent: number;

    factionRelations: Record<Faction, FactionRelation>;
    heroRelations: Record<string, HeroRelation>;

    inventory: ItemSlot[];
    displayCase: (ItemInstance | null)[];
    employees: Employee[];
    currentCustomerQueue: CustomerInstance[];
    events: any[];
    counterOccupiedBy: string;
    todaySpawned: boolean;
    dayEnded: boolean;
}

function createEmptyInventory(size: number): ItemSlot[] {
    const slots: ItemSlot[] = [];
    for (let i = 0; i < size; i++) slots.push({ item: null, count: 0 });
    return slots;
}

function createEmptyDisplayCase(size: number): (ItemInstance | null)[] {
    const slots: (ItemInstance | null)[] = [];
    for (let i = 0; i < size; i++) slots.push(null);
    return slots;
}

function createDefaultFactionRelations(): Record<Faction, FactionRelation> {
    return {
        'strength':     { favor: 0, level: 0, unlocked: false },
        'intelligence': { favor: 0, level: 0, unlocked: false },
        'agility':      { favor: 0, level: 0, unlocked: false },
        'universal':    { favor: 0, level: 0, unlocked: false },
    };
}

export function createDefaultPlayerData(playerID: number): PlayerData {
const inventory = testdata(); 

    return {
        playerID,
        day: 1,
        phase: 'morning',
        cash: 50000,
        rent: 10,
        factionRelations: createDefaultFactionRelations(),
        heroRelations: {},
        inventory: inventory || createEmptyInventory(48),
        displayCase: createEmptyDisplayCase(6),
        employees: [],
        currentCustomerQueue: [],
        events: [],
        counterOccupiedBy: '',
        todaySpawned: false,
        dayEnded: false,
    };
}

/** 获取或创建英雄关系 */
export function getHeroRelation(state: PlayerData, heroName: string): HeroRelation {
    if (!state.heroRelations[heroName]) {
        state.heroRelations[heroName] = {
            favor: 0,
            unlocked: false,
            tags: [],
            lastSeenDay: state.day,
            tradeCount: 0,
            totalTradeAmount: 0,
        };
    }
    return state.heroRelations[heroName];
}

function testdata() {
    let inventory = createEmptyInventory(48);   
    // 【新增】初始库存：5 种类型各 1~2 件，方便测试购买匹配
    const initItems: { defId: string; condition: number }[] = [
        // 武器
        { defId: 'iron_sword', condition: 0.8 },
        { defId: 'steel_blade', condition: 0.7 },
        // 护甲
        { defId: 'leather_vest', condition: 0.9 },
        { defId: 'chainmail', condition: 0.6 },
        // 饰品
        { defId: 'copper_ring', condition: 0.85 },
        { defId: 'silver_amulet', condition: 0.75 },
        // 消耗品
        { defId: 'healing_potion', condition: 0.95 },
        { defId: 'mana_crystal', condition: 0.9 },
        // 材料
        { defId: 'iron_ore', condition: 0.95 },
        { defId: 'magic_dust', condition: 0.85 },
    ];

    for (let i = 0; i < initItems.length; i++) {
        const item = initItems[i];
        inventory[i].item = {
            uid: `init_${i}_${Time().toFixed(0)}`,
            defId: item.defId,
            condition: item.condition,
            isIdentified: false,
        };
        inventory[i].count = 1;
    }
    return inventory;
}