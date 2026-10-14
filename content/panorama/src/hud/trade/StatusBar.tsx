// content/panorama/src/hud/trade/StatusBar.tsx
import React, { useState, useEffect } from 'react';

interface StatusBarProps {
    onShowHeroRelations: () => void;
    onToggleTradePanel: () => void;
    onShowInventory: () => void;
}

export function StatusBar({ onShowHeroRelations, onToggleTradePanel, onShowInventory }: StatusBarProps) {
    const playerID = Game.GetLocalPlayerID();

    const [data, setData] = useState<{
        day: number;
        phase: string;
        cash: number;
        rent: number;
        factionRelations?: Record<string, { favor: number; level: number; unlocked: boolean }>;
    } | null>(null);

    useEffect(() => {
        const initial = CustomNetTables.GetTableValue('tc_player', `player_${playerID}`) as any;
        if (initial) setData(initial);

        const listenerId = CustomNetTables.SubscribeNetTableListener('tc_player', (_table, key, value) => {
            if (key === `player_${playerID}`) {
                setData(value as any);
            }
        });
        return () => CustomNetTables.UnsubscribeNetTableListener(listenerId);
    }, [playerID]);

    if (!data) return null;

    const rep = data.factionRelations ?? {};
    const strengthFavor = rep['strength']?.favor ?? 0;
    const intelligenceFavor = rep['intelligence']?.favor ?? 0;
    const agilityFavor = rep['agility']?.favor ?? 0;
    const universalFavor = rep['universal']?.favor ?? 0;

    return (
        <Panel style={{
            width: '100%',
            height: '70px',
            backgroundColor: '#0a0a0a',
            borderBottom: '2px solid #FFD700',
            flowChildren: 'down',
            padding: '6px 16px',
        }}>
            {/* 第一行：天数、现金、房租、交易面板开关 */}
            <Panel style={{ flowChildren: 'right', height: '32px', horizontalAlign: 'left' }}>
                <Label text={`第 ${String(data.day)} 天`} style={{ color: '#FFD700', marginRight: '24px', fontSize: '18px' }} />
                <Label text={`现金：${String(data.cash)} 银`} style={{ color: '#FFFFFF', marginRight: '24px', fontSize: '18px' }} />
                <Label text={`房租：${String(data.rent)}/天`} style={{ color: '#AAAAAA', marginRight: '24px', fontSize: '16px' }} />
                <Button onactivate={onToggleTradePanel}>
                    <Label text="交易面板" />
                </Button>
                <Button onactivate={onShowInventory}>         
                    <Label text="库存" />
                </Button>
            </Panel>

            {/* 第二行：派系好感度、英雄关系按钮 */}
            <Panel style={{ flowChildren: 'right', height: '28px', marginTop: '2px', horizontalAlign: 'left' }}>
                <Label text="派系好感：" style={{ color: '#888888', marginRight: '12px', fontSize: '16px' }} />
                <Label text={`力量 ${String(strengthFavor)}`} style={{ color: '#FF6B6B', marginRight: '16px', fontSize: '16px' }} />
                <Label text={`智力 ${String(intelligenceFavor)}`} style={{ color: '#4A90D9', marginRight: '16px', fontSize: '16px' }} />
                <Label text={`敏捷 ${String(agilityFavor)}`} style={{ color: '#4CAF50', marginRight: '16px', fontSize: '16px' }} />
                <Label text={`全才 ${String(universalFavor)}`} style={{ color: '#FFD700', marginRight: '24px', fontSize: '16px' }} />
                <Button onactivate={onShowHeroRelations}>
                    <Label text="英雄关系" />
                </Button>
            </Panel>
        </Panel>
    );
}