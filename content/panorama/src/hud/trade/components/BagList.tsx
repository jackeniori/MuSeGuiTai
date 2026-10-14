// content/panorama/src/hud/trade/components/BagList.tsx
import React from 'react';
import { BagItem } from '../types';

interface BagListProps {
    bag: BagItem[];
    selectedIndex: number;
    buyAllMode: boolean;
    onSelect: (index: number) => void;
}

export function BagList({ bag, selectedIndex, buyAllMode, onSelect }: BagListProps) {
    return (
        <Panel style={{
            width: '360px',
            marginTop: '8px',
            backgroundColor: '#2a2a2a',
            flowChildren: 'down',
            padding: '8px',
        }}>
            {bag.filter(item => item != null).map((item, idx) => {
                const isSelected = idx === selectedIndex && !buyAllMode;
                return (
                    <Button
                        key={item.uid || String(idx)}
                        onactivate={() => {
                            if (!buyAllMode) onSelect(idx);
                        }}
                        style={{ marginBottom: '4px' }}
                    >
                        <Label
                            text={`${isSelected ? '● ' : '○ '}${item.defId || '未知'}  [${item.type || 'unknown'}]  成色 ${String(Math.round((item.condition ?? 0) * 100))}%`}
                            style={{ color: 'white', fontSize: '14px' }}
                        />
                    </Button>
                );
            })}
        </Panel>
    );
}