// content/panorama/src/hud/trade/components/TierButtons.tsx
import React from 'react';
import { OfferTier } from '../types';

interface TierButtonsProps {
    onSubmitTier: (tier: OfferTier) => void;
    onEndTrade: () => void;
}

export function TierButtons({ onSubmitTier, onEndTrade }: TierButtonsProps) {
    return (
        <Panel style={{ marginTop: '8px', flowChildren: 'down' }}>
            {/* 第一行：加价 + 接受 */}
            <Panel style={{ flowChildren: 'right' }}>
                <Button onactivate={() => onSubmitTier('accept')} style={{ marginRight: '8px' }}>
                    <Label text="接受" />
                </Button>
                <Button onactivate={() => onSubmitTier('overpay1')} style={{ marginRight: '8px' }}>
                    <Label text="加价·中" />
                </Button>
                <Button onactivate={() => onSubmitTier('overpay2')}>
                    <Label text="加价·重" />
                </Button>
            </Panel>

            {/* 第二行：砍价 + 结束交易 */}
            <Panel style={{ flowChildren: 'right', marginTop: '4px' }}>
                <Button onactivate={() => onSubmitTier('haggle1')} style={{ marginRight: '8px' }}>
                    <Label text="砍价·轻" />
                </Button>
                <Button onactivate={() => onSubmitTier('haggle2')} style={{ marginRight: '8px' }}>
                    <Label text="砍价·狠" />
                </Button>
                <Button onactivate={onEndTrade}>
                    <Label text="结束交易" />
                </Button>
            </Panel>
        </Panel>
    );
}