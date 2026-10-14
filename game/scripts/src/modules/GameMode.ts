import { initAllPlayers, getAllPlayerStates, syncPlayerState,getPlayerState } from "../state"; 
import { PlayerData,createDefaultPlayerData } from '../player_data';
import { spawnCustomers } from '../customerSpawn';
import { onPlayerOffer,onPlayerRefuse,onEndTrade, onPlayerSell  } from './dealHandler';
import { initHeroRegistry } from "../modules/heroRegistry";
import { onRequestHeroRelations } from "./heroRelationHandler"; 
export class GameMode {
    players: {[key: number]: PlayerData};
    constructor() {
        //  注册监听事件
        CustomGameEventManager.RegisterListener( "test", Test )  
        CustomGameEventManager.RegisterListener('tc_player_offer', (userId, event) => {
            onPlayerOffer({
                PlayerID: event.PlayerID,
                uid: event.uid,
                tier: event.tier,
                sellIndex: event.sellIndex,
                buyAll: event.buyAll === 1,
            });
        });

        CustomGameEventManager.RegisterListener('tc_end_trade', (userId, event) => {
            onEndTrade({
                PlayerID: event.PlayerID,
                uid: event.uid,
            });
        });
        // 【新增】注册拒绝事件
        CustomGameEventManager.RegisterListener('tc_customer_refused', (userId,event) => {
            print(`[暮色柜台] 收到拒绝：uid=${event.uid}`);
            onPlayerRefuse({
                PlayerID: event.PlayerID,
                uid: event.uid,
            });
        });
        CustomGameEventManager.RegisterListener('tc_player_sell', (userId, event) => {
            onPlayerSell({
                PlayerID: event.PlayerID,
                uid: event.uid,
            });
        });
        // 注册英雄关系查询
        CustomGameEventManager.RegisterListener('tc_request_hero_relations', (userId, event) => {
            onRequestHeroRelations({
                PlayerID: event.PlayerID,
            });
        });
        //CustomGameEventManager.RegisterListener( "master", Master )  
        //监听事件 
        ListenToGameEvent("npc_spawned", keys => this.OnNpcSpawned(keys), undefined);
        //CustomGameEventManager.RegisterListener<{PlayerID: PlayerID;key:string,button:string,pos?:[number, number, number] }>( "Button", Button )  
        //初始化
        // ========== 【修改】延迟初始化，等游戏开始 ==========
        ListenToGameEvent('game_rules_state_change', () => {
            const state = GameRules.State_Get();
            print(`[初始化] 游戏状态变化：state=${state}`);

            // 只在游戏正式开始后初始化DOTA_GAMERULES_STATE_GAME_IN_PROGRESS  
            if (state === GameState.GAME_IN_PROGRESS) { 
                print('[初始化] 游戏开始，初始化玩家状态');
                initHeroRegistry();
                initAllPlayers();

                for (const player of getAllPlayerStates()) {
                    print(`[初始化] 同步玩家 ${player.playerID} 状态到 NetTable`);
                    syncPlayerState(player.playerID);
                }

                print('[初始化] 玩家状态初始化完成');
            }

        }, undefined);
    }
    private OnNpcSpawned(keys: NpcSpawnedEvent) {}
}

function Test(this: void,userId: EntityIndex, event: {
    PlayerID: PlayerID;
    value:string
}){
    let PlayerID = event.PlayerID
    let player = PlayerResource.GetPlayer(PlayerID)
    let hero = player.GetAssignedHero()
    let origin = Vector(hero.GetOrigin().x +300,hero.GetOrigin().y,hero.GetOrigin().z)
    const playerdata = getPlayerState(PlayerID);   // 加 import
    if(event.value=='xianshi'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'xianshi'})
    }else if(event.value=='yincang'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'yincang'})
    }else if(event.value=='guke'){
        spawnCustomers(PlayerID,3)
    }
 
}