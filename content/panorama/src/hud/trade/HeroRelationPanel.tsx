// content/panorama/src/hud/trade/HeroRelationPanel.tsx
import React, { useState, useEffect } from 'react';

/** 英雄名→中文名映射 */
const HERO_NAMES: Record<string, string> = {
    'npc_dota_hero_axe': '斧王',
    'npc_dota_hero_sven': '斯温',
    'npc_dota_hero_crystal_maiden': '水晶室女',
    'npc_dota_hero_lina': '莉娜',
    'npc_dota_hero_antimage': '敌法师',
    'npc_dota_hero_juggernaut': '剑圣',
    'npc_dota_hero_windrunner': '风行者',
    'npc_dota_hero_pudge': '帕吉',
    // ... 后续补全
};

/** 派系颜色 */
const FACTION_INFO: Record<string, { name: string; color: string }> = {
    'strength':     { name: '力量', color: '#FF6B6B' },
    'intelligence': { name: '智力', color: '#4A90D9' },
    'agility':      { name: '敏捷', color: '#4CAF50' },
    'universal':    { name: '全才', color: '#FFD700' },
};

interface Props {
    onClose: () => void;
}

export function HeroRelationPanel({ onClose }: Props) {
    const playerID = Game.GetLocalPlayerID();
    const [heroRelations, setHeroRelations] = useState<Record<string, any>>({});

    useEffect(() => {
        const readData = (value: any) => {
            if (value && value.heroRelations) {
                setHeroRelations(value.heroRelations);
            }
        };

        const initial = CustomNetTables.GetTableValue('tc_player', `player_${playerID}`) as any;
        readData(initial);

        const listenerId = CustomNetTables.SubscribeNetTableListener('tc_player', (_table, key, value) => {
            if (key === `player_${playerID}`) {
                readData(value);
            }
        });
        return () => CustomNetTables.UnsubscribeNetTableListener(listenerId);
    }, [playerID]);

    const list = Object.entries(heroRelations)
        .map(([heroName, rel]: [string, any]) => ({
            heroName,
            displayName: HERO_NAMES[heroName] ?? heroName,
            favor: rel.favor ?? 0,
            tradeCount: rel.tradeCount ?? 0,
            totalTradeAmount: rel.totalTradeAmount ?? 0,
        }))
        .sort((a, b) => Math.abs(b.favor) - Math.abs(a.favor));

    return (
        <Panel style={{
            width: '640px', height: '520px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #FFD700',
            flowChildren: 'down', padding: '16px',
            verticalAlign: 'center', horizontalAlign: 'center',
        }}>
            <Panel style={{ flowChildren: 'right', height: '32px' }}>
                <Label text="英雄关系" style={{ color: '#FFD700', fontSize: '20px', marginRight: '24px' }} />
                <Button onactivate={onClose}>
                    <Label text="关闭" />
                </Button>
            </Panel>

            <Panel style={{
                flowChildren: 'right', height: '28px',
                marginTop: '8px', borderBottom: '1px solid #555',
            }}>
                <Label text="英雄" style={{ width: '180px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="好感度" style={{ width: '100px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="交易次数" style={{ width: '100px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="累计金额" style={{ width: '120px', color: '#AAAAAA', fontSize: '14px' }} />
            </Panel>

            <Panel style={{
                width: '100%', height: '400px',
                flowChildren: 'down', overflow: 'scroll',
                marginTop: '4px',
            }}>
                {list.length === 0 ? (
                    <Label text="暂无英雄关系数据" style={{ color: '#888888', marginTop: '16px' }} />
                ) : (
                    list.map((r) => {
                        const favorColor = r.favor > 0 ? '#4CAF50' : (r.favor < 0 ? '#FF5722' : '#AAAAAA');
                        return (
                            <Panel key={r.heroName} style={{
                                flowChildren: 'right', height: '28px',
                                borderBottom: '1px solid #333',
                            }}>
                                <Label text={r.displayName} style={{ width: '180px', color: '#FFFFFF', fontSize: '14px' }} />
                                <Label text={`${r.favor}`} style={{ width: '100px', color: favorColor, fontSize: '14px' }} />
                                <Label text={`${r.tradeCount}`} style={{ width: '100px', color: '#AAAAAA', fontSize: '14px' }} />
                                <Label text={`${r.totalTradeAmount}`} style={{ width: '120px', color: '#AAAAAA', fontSize: '14px' }} />
                            </Panel>
                        );
                    })
                )}
            </Panel>
        </Panel>
    );
}