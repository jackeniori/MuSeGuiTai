// game/scripts/src/modules/heroRelationHandler.ts
import { getPlayerState } from "../state";
import { HeroRelation } from "../player_data";
import { getHeroProfile, getHeroState } from "./heroRegistry";

/**
 * 处理客户端请求英雄关系数据
 */
export function onRequestHeroRelations(event: { PlayerID: number }): void {
    const playerID = event.PlayerID;
    const state = getPlayerState(playerID);

    // 把 heroRelations 转成一个数组，附带英雄名和派系
    const result: Array<{
        heroName: string;
        displayName: string;
        faction: string;
        favor: number;
        tradeCount: number;
        totalTradeAmount: number;
        isHired: boolean;
        hiredBy: number;
    }> = [];

    for (const heroName in state.heroRelations) {
        const rel: HeroRelation = state.heroRelations[heroName];
        const profile = getHeroProfile(heroName);
        const heroState = getHeroState(heroName);

        result.push({
            heroName: heroName,
            displayName: profile ? profile.displayName : heroName,
            faction: profile ? profile.faction : 'universal',
            favor: rel.favor,
            tradeCount: rel.tradeCount,
            totalTradeAmount: rel.totalTradeAmount,
            isHired: heroState ? heroState.hiredBy !== -1 : false,
            hiredBy: heroState ? heroState.hiredBy : -1,
        });
    }

    // 按好感度绝对值排序
    result.sort((a, b) => Math.abs(b.favor) - Math.abs(a.favor));

    print(`[英雄关系] 玩家 ${playerID} 有 ${result.length} 条英雄关系`);

    CustomGameEventManager.Send_ServerToAllClients('tc_hero_relations_response', {
        playerID: playerID,
        relations: JSON.stringify(result),
    });
}