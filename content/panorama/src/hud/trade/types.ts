// content/panorama/src/hud/trade/types.ts

/** bag 里的单件物品 */
export interface BagItem {
    uid: string;
    defId: string;
    type: string;
    condition: number;
    price: number;
    isIdentified: 0 | 1;
}
/** 库存里的单件物品 */
export interface InventoryItem {
    slot: number;
    uid: string;
    defId: string;
    type: string;
    condition: number;
    isIdentified: 0 | 1;
}
/** 顾客到达事件的数据 */
export interface CustomerArrivedData {
    uid: string;
    defId: string;
    itemDefId?: string;
    condition?: number;
    isIdentified?: 0 | 1;
    buyInterest: string;
    offerPrice?: number;
    bagList: string;
    buyItemUid?: string;
    buyItemDefId?: string;
    buyItemCondition?: number;
    buyOfferPrice?: number;
    customerCash?: number;
}

/** 交易结果事件的数据 */
export interface DealResultData {
    uid: string;
    accepted: 0 | 1;
    finalPrice?: number;
    counterOffer?: number;
    tier?: string;
    reputationDelta?: number;
    rejectReason?: string;
    softReject?: 0 | 1;
    sellIndex?: number;
    remainingBag?: string;
    allDone?: 0 | 1;
}

/** 卖出结果事件的数据 */
export interface SellResultData {
    uid: string;
    accepted: 0 | 1;
    price?: number;
    itemDefId?: string;
    reason?: string;
}

/** 档位类型 */
export type OfferTier = 'accept' | 'haggle1' | 'haggle2' | 'overpay1' | 'overpay2';