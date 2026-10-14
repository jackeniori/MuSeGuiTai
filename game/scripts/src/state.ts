// game/scripts/src/modules/state.ts
import { PlayerData, createDefaultPlayerData } from "./player_data";
import { getItemDef } from "./items";
/** 所有玩家的状态字典 */
const playerStates: Record<number, PlayerData> = {};

/** 初始化所有已连接玩家 */
export function initAllPlayers(): void {
    const count = PlayerResource.GetPlayerCount();
    print(`[初始化] 玩家总数=${count}`);   // 【加日志】

    for (let i = 0; i < count; i++) {
        const valid = PlayerResource.IsValidPlayerID(i);
        print(`[初始化] 槽位 ${i} 有效=${valid}`);   // 【加日志】
        if (valid) {
            playerStates[i] = createDefaultPlayerData(i);
        }
    }
    print(`[暮色柜台] 初始化了 ${Object.keys(playerStates).length} 个玩家`);
}

/** 取某个玩家的状态（不存在则创建） */
export function getPlayerState(playerID: number): PlayerData {
    if (!playerStates[playerID]) {
        playerStates[playerID] = createDefaultPlayerData(playerID);
    }
    return playerStates[playerID];
}

/** 删除玩家状态 */
export function removePlayerState(playerID: number): void {
    delete playerStates[playerID];
}

/** 遍历所有玩家 */
export function getAllPlayerStates(): PlayerData[] {
    return Object.values(playerStates);
}

/** 把玩家关键状态同步到 NetTable，客户端用来显示金币和日期 */
export function syncPlayerState(playerID: number): void {
    const state = getPlayerState(playerID);
    print(`[NetTable] 同步玩家 ${playerID}: day=${state.day}, cash=${state.cash}`);   
    CustomNetTables.SetTableValue('tc_player', `player_${playerID}`, {
        day: state.day,
        phase: state.phase,
        cash: state.cash,
        rent: state.rent,
        factionRelations: state.factionRelations,    
        heroRelations: state.heroRelations,       
        inventory: serializeInventory(state.inventory),  
    });
}

function serializeInventory(inventory: ItemSlot[]): string {
    const parts: string[] = [];
    for (let i = 0; i < inventory.length; i++) {
        const slot = inventory[i];
        if (slot.item) {
            const def = getItemDef(slot.item.defId);
            const type = def ? def.type : 'unknown';
            const identified = slot.item.isIdentified ? 'true' : 'false';
            parts.push(`{"slot":${i},"uid":"${slot.item.uid}","defId":"${slot.item.defId}","type":"${type}","condition":${slot.item.condition},"isIdentified":${identified}}`);
        }
    }
    return `[${parts.join(',')}]`;
}
export function setPlayerState(playerID: number, data: PlayerData): void {
    playerStates[playerID] = data;
}