// content/panorama/src/hud/trade/InventoryPanel.tsx
import React, { useState, useEffect } from 'react';
import { InventoryItem } from './types';

interface InventoryPanelProps {
    onClose: () => void;
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
    const playerID = Game.GetLocalPlayerID();
    const [items, setItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const readData = (value: any) => {
            if (!value || !value.inventory) return;
            try {
                const parsed = JSON.parse(value.inventory);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                }
            } catch (e) {
                $.Msg('[库存] 解析失败：', e);
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

    return (
        <Panel style={{
            width: '520px',
            height: '480px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #FFD700',
            flowChildren: 'down',
            padding: '16px',
        }}>
            {/* 标题栏 */}
            <Panel style={{ flowChildren: 'right', height: '32px' }}>
                <Label text={`库存（${String(items.length)} 件）`} style={{ color: '#FFD700', fontSize: '20px', marginRight: '24px' }} />
                <Button onactivate={onClose}>
                    <Label text="关闭" />
                </Button>
            </Panel>

            {/* 表头 */}
            <Panel style={{
                flowChildren: 'right',
                height: '28px',
                marginTop: '8px',
                borderBottom: '1px solid #555',
            }}>
                <Label text="物品" style={{ width: '180px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="类别" style={{ width: '100px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="成色" style={{ width: '80px', color: '#AAAAAA', fontSize: '14px' }} />
                <Label text="状态" style={{ width: '80px', color: '#AAAAAA', fontSize: '14px' }} />
            </Panel>

            {/* 数据行 */}
            <Panel style={{
                width: '100%',
                height: '380px',
                flowChildren: 'down',
                marginTop: '4px',
            }}>
                {items.length === 0 ? (
                    <Label text="库存为空" style={{ color: '#888888', marginTop: '16px' }} />
                ) : (
                    items.map((item) => {
                        const condPct = Math.round((item.condition ?? 0) * 100);
                        return (
                            <Panel key={item.uid} style={{
                                flowChildren: 'right',
                                height: '28px',
                                borderBottom: '1px solid #333',
                            }}>
                                <Label text={item.defId || '未知'} style={{ width: '180px', color: '#FFFFFF', fontSize: '14px' }} />
                                <Label text={item.type || 'unknown'} style={{ width: '100px', color: '#4A90D9', fontSize: '14px' }} />
                                <Label text={`${String(condPct)}%`} style={{ width: '80px', color: condPct > 70 ? '#4CAF50' : '#FF5722', fontSize: '14px' }} />
                                <Label text={item.isIdentified === 1 ? '已鉴定' : '未鉴定'} style={{ width: '80px', color: '#AAAAAA', fontSize: '14px' }} />
                            </Panel>
                        );
                    })
                )}
            </Panel>
        </Panel>
    );
}