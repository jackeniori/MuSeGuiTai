import React, { useState, useEffect } from 'react';

interface CustomGameEventDeclarations {
    tc_customer_arrived: {
        uid: string;
        defId: string;
        itemDefId: string;
        condition: number;
        isIdentified: boolean;
        buyInterest: string;
        offerPrice: number;
    };
    tc_customer_left: { uid: string };
}

/** 顾客到达事件的数据结构（与服务端事件一致） */
interface CustomerArrivedData {
    uid: string;
    defId: string;
    itemDefId?: string;
    condition?: number;
    isIdentified?: 0 | 1;    // ← 改成 0 | 1
    buyInterest: string;
    offerPrice?: number;
}
/** 交易结果事件的数据结构 */
interface DealResultData {
    uid: string;
    accepted: 0 | 1; 
    finalPrice?: number;
    counterOffer?: number;
}
export function TradePanel() {
    const [visible, setVisible] = useState<boolean>(false);
    const [customer, setCustomer] = useState<CustomerArrivedData | null>(null);
    // 玩家出价
    const [offerPrice, setOfferPrice] = useState<number>(0);
    // 交易结果文本
    const [resultText, setResultText] = useState<string>('');
    useEffect(() => {
        const handler = (data: CustomerArrivedData) => {
        $.Msg('[暮色柜台] 收到顾客到达：', data.uid);
        $.Msg('[暮色柜台] 完整数据：', data.defId, data.itemDefId, data.condition, data.buyInterest, data.offerPrice);
            setCustomer(data);
            setOfferPrice(0);     
            setResultText('');      
            setVisible(true);
        };
        const subId = GameEvents.Subscribe('tc_customer_arrived', handler);
        return () => GameEvents.Unsubscribe(subId);
    }, []);
 // 【新增】监听交易结果
    useEffect(() => {
        const handler = (data: DealResultData) => {
            $.Msg('[3] 收到交易结果 accepted=', data.accepted, ' counter=', data.counterOffer);
            if (data.accepted === 1) {
                setResultText(`成交！最终价格：${data.finalPrice} 银`);
                $.Schedule(1.5, () => {
                    setVisible(false);
                    setCustomer(null);
                    setResultText('');
                });
            } else {
                setResultText(`顾客拒绝，还价：${data.counterOffer ?? 0} 银`);
            }
        };
        const subId = GameEvents.Subscribe('tc_deal_result', handler);
        return () => GameEvents.Unsubscribe(subId);
    }, []);

    // 【新增】提交报价
    const handleSubmit = () => {
        if (!customer) return;
        GameEvents.SendCustomGameEventToServer('tc_player_offer', {
            PlayerID: Game.GetLocalPlayerID(),
            uid: customer.uid,
            price: offerPrice,
        });
    };
    if (!visible || !customer) return null;

    const conditionPercent: number = Math.round((customer.condition ?? 0) * 100);
    const identifiedText: string = customer.isIdentified ? '已鉴定' : '未鉴定';

return (
        <Panel style={{
            width: '480px',
            height: '460px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #FFD700',
            flowChildren: 'down',
            padding: '16px',
        }}>
            {/* 顾客信息 */}
            <Label text={`顾客：${customer.defId}`} style={{ color: '#FFD700', fontSize: '20px' }} />
            <Label text={`想买：${customer.buyInterest || '无'}`} style={{ color: '#AAAAAA' }} />

            {/* 物品卡 */}
            <Panel style={{
                width: '100%',
                height: '120px',
                marginTop: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #555',
                flowChildren: 'down',
                padding: '8px',
            }}>
                <Label text={`出售物品：${customer.itemDefId}`} style={{ color: '#FFFFFF', fontSize: '18px' }} />
                <Label text={`成色：${conditionPercent}%`} style={{ color: conditionPercent > 70 ? '#4CAF50' : '#FF5722' }} />
                <Label text={`状态：${identifiedText}`} style={{ color: '#AAAAAA' }} />
                <Label text={`顾客开价：${customer.offerPrice} 银`} style={{ color: '#FFD700' }} />
            </Panel>

            {/* 【新增】报价滑块 */}
            <Panel style={{ marginTop: '16px', flowChildren: 'right' }}>
                <Button onactivate={() => setOfferPrice(Math.max(0, offerPrice - 50))}>
                    <Label text="-50" />
                </Button>
                <Label text={`${offerPrice} 银`} style={{ color: '#FFD700', margin: '0 16px' }} />
                <Button onactivate={() => setOfferPrice(offerPrice + 50)}>
                    <Label text="+50" />
                </Button>
            </Panel>

            {/* 【新增】交易结果提示 */}
            {resultText !== '' && (
                <Label text={resultText} style={{ color: '#FFD700', marginTop: '8px' }} />
            )}

            {/* 【修改】按钮区新增提交按钮 */}
            <Panel style={{ marginTop: '16px', flowChildren: 'right' }}>
                <Button onactivate={handleSubmit}>
                    <Label text="提交报价" />
                </Button>
                <Button onactivate={() => setVisible(false)}>
                    <Label text="关闭" />
                </Button>
            </Panel>

        </Panel>
    );
}