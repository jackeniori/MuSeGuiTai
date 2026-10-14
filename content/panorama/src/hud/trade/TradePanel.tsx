// content/panorama/src/hud/trade/TradePanel.tsx
import React, { useState, useEffect } from 'react';
import { BagItem, CustomerArrivedData, DealResultData, SellResultData, OfferTier } from './types';
import { TierButtons } from './components/TierButtons';
import { BagList } from './components/BagList';

// ========== 交易面板 ==========

export function TradePanel() {
    const [visible, setVisible] = useState<boolean>(false);
    const [customer, setCustomer] = useState<any>(null);
    const [bag, setBag] = useState<BagItem[]>([]);
    const [buyRequest, setBuyRequest] = useState<{
        uid: string;
        defId: string;
        condition: number;
        price: number;
    } | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [buyAllMode, setBuyAllMode] = useState<boolean>(false);
    const [resultText, setResultText] = useState<string>('');

    const submitTier = (tier: OfferTier) => {
        if (!customer) return;
        if (bag.length === 0) {
            setResultText('顾客没有物品可交易');
            return;
        }
        GameEvents.SendCustomGameEventToServer('tc_player_offer', {
            PlayerID: Game.GetLocalPlayerID(),
            uid: customer.uid,
            tier: tier,
            sellIndex: selectedIndex,
            buyAll: buyAllMode ? 1 : 0,
        });
    };

    // 把开关函数暴露到全局
    useEffect(() => {
        GameUI.global.toggleTradePanel = () => setVisible(prev => !prev);
        GameUI.global.showTradePanel = () => setVisible(true);
        GameUI.global.hideTradePanel = () => setVisible(false);
        return () => {
            delete GameUI.global.toggleTradePanel;
            delete GameUI.global.showTradePanel;
            delete GameUI.global.hideTradePanel;
        };
    }, []);

    const handleEndTrade = () => {
        if (!customer) return;
        GameEvents.SendCustomGameEventToServer('tc_end_trade', {
            PlayerID: Game.GetLocalPlayerID(),
            uid: customer.uid,
        });

        setVisible(false);
        setCustomer(null);
        setBag([]);
        setBuyRequest(null);
        setResultText('');
        setBuyAllMode(false);
    };

    const handleSell = () => {
        if (!customer) return;
        GameEvents.SendCustomGameEventToServer('tc_player_sell', {
            PlayerID: Game.GetLocalPlayerID(),
            uid: customer.uid,
        });
    };

    // 顾客到达（唯一一个，合并了之前两个）
    useEffect(() => {
        const handler = (data: any) => {
            setCustomer(data);
            try {
                const parsed = JSON.parse(data.bagList);
                if (Array.isArray(parsed)) {
                    setBag(parsed);
                } else {
                    setBag([]);
                }
            } catch (e) {
                setBag([]);
            }

            // 设置购买需求
            if (data.buyItemDefId && data.buyItemDefId !== '') {
                setBuyRequest({
                    uid: data.buyItemUid ?? '',
                    defId: data.buyItemDefId,
                    condition: data.buyItemCondition ?? 0,
                    price: data.buyOfferPrice ?? 0,
                });
            } else {
                setBuyRequest(null);
            }

            setSelectedIndex(0);
            setResultText('');
            setBuyAllMode(false);
            setVisible(true);
        };
        const subId = GameEvents.Subscribe('tc_customer_arrived', handler);
        return () => GameEvents.Unsubscribe(subId);
    }, []);

    // 交易结果（报价成交/拒绝）
    useEffect(() => {
        const handler = (data: any) => {
            try {
                if (data.accepted) {
                    setResultText(`成交！价格 ${String(data.finalPrice ?? 0)} 银`);
                    if (data.remainingBag) {
                        const parsed = JSON.parse(data.remainingBag);
                        if (Array.isArray(parsed)) {
                            setBag(parsed);
                            setSelectedIndex(0);
                        }
                    }
                } else {
                    setResultText(data.rejectReason ?? '顾客拒绝');
                }
            } catch (e) {
                $.Msg('[交易] tc_deal_result 处理失败：', e);
            }
        };
        const subId = GameEvents.Subscribe('tc_deal_result', handler);
        return () => GameEvents.Unsubscribe(subId);
    }, []);

    // 【新增】卖出结果
    useEffect(() => {
        const handler = (data: any) => {
            if (data.accepted === 1) {
                setResultText(`卖出成功！${data.itemDefId || '物品'} 卖了 ${String(data.price ?? 0)} 银`);
            } else {
                setResultText(`卖出失败：${data.reason ?? '未知原因'}`);
            }
            // 【关键】无论成功失败都清空购买需求，防止重复点
            setBuyRequest(null);
        };
        const subId = GameEvents.Subscribe('tc_sell_result', handler);
        return () => GameEvents.Unsubscribe(subId);
    }, []);

    if (!visible || !customer) return null;

    const selectedItem = bag[selectedIndex];

    return (
        <Panel style={{
            width: '400px',
            height: '460px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #FFD700',
            flowChildren: 'down',
            horizontalAlign: 'center',
            verticalAlign: 'center',
            padding: '16px',
        }}>
            {/* 顾客信息 */}
            <Label text={`顾客：${customer.defId || '未知'}`} style={{ color: '#FFD700', fontSize: '20px' }} />
            <Label text={`想买：${customer.buyInterest || '无'}`} style={{ color: '#AAAAAA' }} />
            <Label text={`顾客资金：${String(customer.customerCash ?? 0)} 银`} style={{ color: '#4CAF50' }} />

            {/* bag 列表 */}
            <BagList
                bag={bag}
                selectedIndex={selectedIndex}
                buyAllMode={buyAllMode}
                onSelect={(idx) => setSelectedIndex(idx)}
            />

            {/* 购买需求 */}
            {buyRequest ? (
                <Panel style={{
                    width: '360px',
                    marginTop: '8px',
                    backgroundColor: '#1a3a1a',
                    border: '2px solid #4CAF50',
                    padding: '8px',
                    flowChildren: 'down',
                }}>
                    <Label text="顾客想买：" style={{ color: '#4CAF50', fontSize: '14px' }} />
                    <Label
                        text={`${buyRequest.defId || '未知'}  出价 ${String(buyRequest.price ?? 0)} 银`}
                        style={{ color: '#FFD700', fontSize: '16px' }}
                    />
                    <Label
                        text={`顾客资金：${String(customer.customerCash ?? 0)} 银`}
                        style={{ color: '#AAAAAA', fontSize: '14px' }}
                    />
                    <Button onactivate={handleSell} style={{ marginTop: '4px' }}>
                        <Label text="卖给他" />
                    </Button>
                </Panel>
            ) : null}

            {/* 结果提示 */}
            {resultText ? (
                <Label text={resultText} style={{ color: '#FFD700', marginTop: '8px' }} />
            ) : null}

            {/* 选中/全买提示 */}
            <Panel style={{
                width: '360px',
                marginTop: '8px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #555',
                padding: '8px',
            }}>
                <Label
                    text={
                        buyAllMode
                            ? `全买模式：${String(bag.length)} 件，总价约 ${String(Math.floor(bag.reduce((s, i) => s + (i.price ?? 0), 0) * 0.8))} 银（0.8折）`
                            : selectedItem
                                ? `选中：${selectedItem.defId || '未知'}（成色 ${String(Math.round((selectedItem.condition ?? 0) * 100))}%）  约 ${String(Math.floor((selectedItem.price ?? 0) * 0.9))} 银（0.9折）`
                                : '请选择一件物品'
                    }
                    style={{ color: '#FFD700', fontSize: '14px' }}
                />
            </Panel>

            {/* 模式切换 */}
            <Panel style={{ marginTop: '8px', flowChildren: 'right' }}>
                <Button
                    onactivate={() => setBuyAllMode(false)}
                    style={{ marginRight: '8px' }}
                >
                    <Label text={!buyAllMode ? `● 单件（0.9折）` : `○ 单件（0.9折）`} />
                </Button>
                <Button onactivate={() => setBuyAllMode(true)}>
                    <Label text={buyAllMode ? `● 全买（0.8折，${String(bag.length)}件）` : `○ 全买（0.8折，${String(bag.length)}件）`} />
                </Button>
            </Panel>

            {/* 档位按钮 */}
            <TierButtons
                onSubmitTier={submitTier}
                onEndTrade={handleEndTrade}
            />

            {/* 关闭 */}
            <Button onactivate={() => setVisible(false)} style={{ marginTop: '8px' }}>
                <Label text="关闭" />
            </Button>
        </Panel>
    );
}