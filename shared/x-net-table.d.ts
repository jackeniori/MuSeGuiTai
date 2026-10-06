declare interface XNetTableDefinitions {
    test_table: {
        test_key: {
            data_1: string;
            data_2?: number;
            data_3?: boolean[];
            data_t?: any;
        };
    };
    settings: {
        basicSettings: BasicSettings;
    };
}

declare interface BasicSettings {}

// 专门为性能调试模块增加的表
declare interface XNetTableDefinitions {
    performance_debug: {
        [key: string]: any;
    };
}

declare interface XNetTableObject {
    table_name: string;
    key: string;
    content: any;
}

declare interface XNetTableDataJSON {
    table: string;
    key: string;
    value: any;
}


// 以下是库内部使用的，勿动
declare interface CustomGameEventDeclarations {
    x_net_table: {
        data:
            | string // 要么是以字符串形式发送的数据块
            | XNetTableObject; // 要么是一次性发送的数据
    };
    tc_customer_arrived: { uid: string; defId: string; itemDefId?: string; condition?: number; isIdentified?: boolean; buyInterest: string; offerPrice?: number };
    tc_customer_left: { uid: string };
    tc_update_state: { phase: string; day: number; money: number };
    // 新增：交易结果
    tc_deal_result: {
        uid: string;
        accepted: boolean;
        finalPrice?: number;
        counterOffer?: number;
    };

    // 新增：玩家报价（客户端 → 服务端）
    tc_player_offer: {
        PlayerID: number;
        uid: string;
        price: number;
    };
    ItemDef: {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
    basePrice: number;      // 基准价（银币）
    minCondition: number;   // 0.0 ~ 1.0
    maxCondition: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    description?: string;
    };

    ItemInstance: ItemInstance;

    CustomerDef: {
    heroName: string;       // Dota英雄名，如'npc_dota_hero_axe'
    displayName: string;
    personality: 'greedy' | 'cautious' | 'generous' | 'desperate';
    faction: string;
    initialOfferItems: string[];   // 带来的物品defId列表
    buyInterest: string[];         // 想买的物品类型
    };

    CustomerInstance: CustomerInstance;




// ===== 员工（第二期用） =====
    Employee: Employee;
}
// ===== 游戏状态 =====


interface  ItemInstance {
    uid: string;            // 唯一标识
    defId: string;
    condition: number;      // 当前成色 0~1
    isIdentified: boolean;
    extraTags?: string[];
}

// ===== 员工（第二期用） =====
interface Employee {
    id: string;
    heroName: string;
    loyalty: number;        // 0~100
    stamina: number;        // 0~100
    skills: string[];
    equipment: { weapon?: string; armor?: string; accessory?: string };
}
//顾客
interface CustomerInstance {
    uid: string;   
    defId: string; //顾客的模板定义 ID 如 "npc_dota_hero_axe"
    entityIndex: EntityIndex;    // Dota单位索引
    state: 'spawning' | 'walking' | 'atCounter' | 'negotiating' | 'done' | 'leaving';
    currentItemForSale?: ItemInstance;//顾客当前所处的状态，驱动 AI 状态机。	'spawning'（生成中）、'walking'（走向柜台）、'atCounter'（已到柜台）、'negotiating'（谈判中）、'done'（交易完成）、'leaving'（离开）
    buyInterest: string; // 顾客想买的物品类型（如'weapon' | 'armor' | 'potion'）
    offerPrice?: number;     // 当前出价
    reputationDelta: number; // 本次交易后好感度变化
}
type CustomerPersonality = 'greedy' | 'cautious' | 'generous' | 'desperate';

interface CustomerDef {
  heroName: string;           // Dota英雄名，如'npc_dota_hero_axe'
  displayName: string;        // 显示给玩家的顾客名称（如“流浪剑客”、“神秘商人”）
  personality: CustomerPersonality;  // 顾客性格类型，影响议价、等待时间等行为（如'greedy' | 'generous' | 'patient'）
  faction: string;            // 顾客所属阵营/派系，用于解锁特殊交易或剧情线（如'radiant' | 'dire' | 'neutral'）
  initialOfferItems: string[]; // 带来的物品defId列表
  buyInterest: string[];      // 想买的物品类型（如'weapon' | 'armor' | 'potion'）
}

