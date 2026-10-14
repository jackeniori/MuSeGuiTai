// game/scripts/src/modules/saveLoad.ts
import { getPlayerState, getAllPlayerStates, setPlayerState } from "../state";
import { PlayerData } from "../player_data";
import {
    getAllHeroStates, setHeroState, HeroState
} from "./heroRegistry";
import { Faction } from "./factions";

/** 存档版本号 */
const SAVE_VERSION = 1;

/** 完整存档结构 */
export interface SaveData {
    version: number;
    savedAt: number;
    global: GlobalSaveData;
    players: Record<number, PlayerSaveData>;
}

/** 全局层 */
export interface GlobalSaveData {
    currentDay: number;
    heroStates: Record<string, HeroState>;
}

/** 玩家层（只存可变字段） */
export interface PlayerSaveData {
    playerID: number;
    day: number;
    phase: string;
    cash: number;
    rent: number;
    factionRelations: Record<Faction, { favor: number; level: number; unlocked: boolean }>;
    heroRelations: Record<string, any>;
    inventory: ItemSlot[];
    displayCase: (ItemInstance | null)[];
}

/** 保存游戏：收集全局 + 所有玩家 */
export function saveGame(currentDay: number): SaveData {
    const data: SaveData = {
        version: SAVE_VERSION,
        savedAt: Time(),
        global: {
            currentDay: currentDay,
            heroStates: getAllHeroStates(),
        },
        players: {},
    };

    for (const player of getAllPlayerStates()) {
        data.players[player.playerID] = {
            playerID: player.playerID,
            day: player.day,
            phase: player.phase,
            cash: player.cash,
            rent: player.rent,
            factionRelations: player.factionRelations,
            heroRelations: player.heroRelations,
            inventory: player.inventory,
            displayCase: player.displayCase,
        };
    }

    print(`[存档] 保存成功：第 ${currentDay} 天，${Object.keys(data.players).length} 位玩家`);
    return data;
}

/** 读档：还原全局 + 玩家 */
export function loadGame(data: SaveData): number {
    if (data.version !== SAVE_VERSION) {
        print(`[存档] 版本不匹配：${data.version} vs ${SAVE_VERSION}`);
        return -1;
    }

    // 1. 还原全局层
    for (const heroName in data.global.heroStates) {
        setHeroState(heroName, data.global.heroStates[heroName]);
    }
    print(`[存档] 还原了 ${Object.keys(data.global.heroStates).length} 个英雄状态`);

    // 2. 还原玩家层
    for (const playerID in data.players) {
        const p = data.players[Number(playerID)];
        const state = getPlayerState(Number(playerID));
        state.day = p.day;
        state.phase = p.phase as any;
        state.cash = p.cash;
        state.rent = p.rent;
        state.factionRelations = p.factionRelations;
        state.heroRelations = p.heroRelations;
        state.inventory = p.inventory;
        state.displayCase = p.displayCase;
        state.currentCustomerQueue = [];
        state.counterOccupiedBy = '';
        state.todaySpawned = false;
        state.dayEnded = false;
    }
    print(`[存档] 还原了 ${Object.keys(data.players).length} 位玩家`);

    return data.global.currentDay;
}