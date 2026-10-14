// content/panorama/src/hud/script.tsx（或你的入口文件路径）
import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';
import { MainPanel } from './main';
import { TwilightCounterMainPanel } from '../hud/trade/components/twilight_counter_main';

import { TradePanel } from './trade/TradePanel';
import { StatusBar } from './trade/StatusBar';
// 【导入英雄关系弹窗
import { HeroRelationPanel } from './trade/HeroRelationPanel';
import { InventoryPanel } from './trade/InventoryPanel';
import { render } from 'react-panorama-x';
import React, { useState, useEffect, useCallback } from "react";

declare global {
    interface CDOTA_PanoramaScript_GameUI {
        global?: any;
    }  
}  
class ErrorBoundary extends React.Component<{ children: any; name: string }, { hasError: boolean, error: any }> {
constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
}
static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
}
componentDidCatch(error: any) {
    $.Msg(`[错误边界] 组件 "${this.props.name}" 崩溃:`, error);
}
render() {
    if (this.state.hasError) {
        return <Label text={`${this.props.name} 渲染失败`} style={{ color: 'red' }} />;
    }
    return this.props.children;
}
}
function GameState() {
    $.Msg('kaishiyunxing     ', Game.GetState());
    GameUI.global = {};
    if (Game.GetState() == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
        render(<Root />, $('#main'));
        return;
    }
    $.Schedule(1, GameState);
}
GameState();

function Root() {
    const [visible, setVisible] = useState<boolean>(false);
    const [heroRelationVisible, setHeroRelationVisible] = useState<boolean>(false);
    const [inventoryVisible, setInventoryVisible] = useState(false);  

    const controlFn = useCallback((force?: boolean) => {
        if (force !== undefined) {
            setVisible(force);
        } else {
            setVisible(prev => !prev);
        }
    }, []);

    useEffect(() => {
        GameUI.global.twilight_counter_main = controlFn;
        return () => { delete GameUI.global.twilight_counter_main; };
    }, [controlFn]);

    const handleToggleTradePanel = () => {
        if (GameUI.global.toggleTradePanel) {
            GameUI.global.toggleTradePanel();
        }
    };
    return (
        <Panel style={{ width: '100%', height: '100%' }}>
            <StatusBar
                onShowHeroRelations={() => setHeroRelationVisible(true)}
                onToggleTradePanel={handleToggleTradePanel}
                onShowInventory={() => setInventoryVisible(true)}
            />
            <MainPanel />
            <ErrorBoundary name="TradePanel">
            <TradePanel />      
            </ErrorBoundary>                             
            {visible ? <TwilightCounterMainPanel /> : null}
            {heroRelationVisible ? (
                <HeroRelationPanel onClose={() => setHeroRelationVisible(false)} />
            ) : null}
            {inventoryVisible ? (                                       // 【新增】
                <InventoryPanel onClose={() => setInventoryVisible(false)} />
            ) : null}
        </Panel>
    );
}