// // ===== 物品 =====
// export interface ItemDef {
//   id: string;
//   name: string;
//   type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
//   basePrice: number;      // 基准价（银币）
//   minCondition: number;   // 0.0 ~ 1.0
//   maxCondition: number;
//   rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
//   description?: string;
// }

// export interface ItemInstance {
//   uid: string;            // 唯一标识
//   defId: string;
//   condition: number;      // 当前成色 0~1
//   isIdentified: boolean;
//   extraTags?: string[];
// }

// // ===== 顾客 =====
// export type CustomerPersonality = 'greedy' | 'cautious' | 'generous' | 'desperate';

// export interface CustomerDef {
//   heroName: string;       // Dota英雄名，如'npc_dota_hero_axe'
//   displayName: string;
//   personality: CustomerPersonality;
//   faction: string;
//   initialOfferItems: string[];   // 带来的物品defId列表
//   buyInterest: string[];         // 想买的物品类型
// }

// export interface CustomerInstance {
//   uid: string;
//   defId: string;
//   entityIndex: EntityIndex;    // Dota单位索引
//   state: 'spawning' | 'walking' | 'atCounter' | 'negotiating' | 'done' | 'leaving';
//   currentItemForSale?: ItemInstance;
//   offerPrice?: number;     // 当前出价
//   patience: number;       // 耐心值，随时间下降
//   reputationDelta: number; // 本次交易后好感度变化
// }

// // ===== 库存 =====
// export interface InventorySlot {
//   item: ItemInstance | null;
//   count: number;
// }

// // ===== 员工（第二期用） =====
// export interface Employee {
//   id: string;
//   heroName: string;
//   loyalty: number;        // 0~100
//   stamina: number;        // 0~100
//   skills: string[];
//   equipment: { weapon?: string; armor?: string; accessory?: string };
// }

// // ===== 游戏状态 =====
// export interface GameState {
//   day: number;
//   phase: 'morning' | 'afternoon' | 'evening' | 'night' | 'deepNight';
//   cash: number;
//   reputation: Record<string, number>;  // 派系好感度
//   inventory: InventorySlot[];
//   employees: Employee[];
//   currentCustomerQueue: CustomerInstance[];
//   events: NightEvent[];
// }

// export interface NightEvent {
//   id: string;
//   type: 'raid' | 'smuggle' | 'dispute' | 'investigation';
//   difficulty: number;
//   description: string;
//   assignedEmployeeIds: string[];
//   resolved: boolean;
// }