import { PlayerData,createDefaultPlayerData } from '../player_data';
import { spawnCustomers } from '../customerSpawn';
import { onPlayerOffer } from './dealHandler';
export class GameMode {
    players: {[key: number]: PlayerData};
    constructor() {
        //  注册监听事件
        CustomGameEventManager.RegisterListener( "test", Test )  
        CustomGameEventManager.RegisterListener('tc_player_offer', (userId, event) => {
            onPlayerOffer({
                PlayerID: userId,
                uid: event.uid,
                price: event.price,
            });
        });
        //CustomGameEventManager.RegisterListener( "master", Master )  
        //监听事件 
        ListenToGameEvent("npc_spawned", keys => this.OnNpcSpawned(keys), undefined);
        //CustomGameEventManager.RegisterListener<{PlayerID: PlayerID;key:string,button:string,pos?:[number, number, number] }>( "Button", Button )  
        //初始化
        const count:number = PlayerResource.GetPlayerCount()
        this.players = {}
        for (let i = 0; i <= count; i++) {
            this.players[i] = createDefaultPlayerData(i as PlayerID);
        }
    }
    private OnNpcSpawned(keys: NpcSpawnedEvent) {

    }
}

function Test(this: void,userId: EntityIndex, event: {
    PlayerID: PlayerID;
    value:string
}){
    let PlayerID = event.PlayerID
    let player = PlayerResource.GetPlayer(PlayerID)
    let hero = player.GetAssignedHero()
    let origin = Vector(hero.GetOrigin().x +300,hero.GetOrigin().y,hero.GetOrigin().z)
    let playerdata = GameRules.Addon.players[PlayerID]
    if(event.value=='xianshi'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'xianshi'})
    }else if(event.value=='yincang'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'yincang'})
    }else if(event.value=='guke'){
        spawnCustomers(3)
    }
 
}