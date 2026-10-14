
declare interface BasicSettings {}

// 专门为性能调试模块增加的表
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

interface ItemSlot {
    item: ItemInstance | null;
    count: number;
}

// 以下是库内部使用的，勿动
declare interface CustomGameEventDeclarations {
    x_net_table: {
        data:
            | string // 要么是以字符串形式发送的数据块
            | XNetTableObject; // 要么是一次性发送的数据
    };
    /** 客户端请求英雄关系数据 */
    tc_request_hero_relations: {
        PlayerID: number;
    };

    /** 服务端返回英雄关系数据 */
    tc_hero_relations_response: {
        playerID: number;
        relations: string;   // JSON 字符串，因为 NetTable/事件不支持复杂嵌套
    }; 
    tc_customer_arrived: {
        playerID: number;
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
    };

    /** 玩家卖东西给顾客 */
    tc_player_sell: {
        PlayerID: number;
        uid: string;
    };

    /** 卖出结果 */
    tc_sell_result: {
        playerID: number;
        uid: string;
        accepted: 0 | 1;
        price?: number;
        itemDefId?: string;
        reason?: string;
    };
    tc_customer_left: { playerID: number;uid: string };
    tc_update_state: { phase: string; day: number; money: number };
    // 新增：交易结果
    tc_deal_result: {
        playerID: number;
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
    };
    /** 玩家拒绝顾客 */
    tc_customer_refused: {
        PlayerID: number;
        uid: string;
    };
    /** 玩家主动结束交易 */
    tc_end_trade: {
        PlayerID: number;
        uid: string;
    };
    // 玩家报价（客户端 → 服务端）
    tc_player_offer: {
        PlayerID: number;
        uid: string;
        tier: 'accept' | 'haggle1' | 'haggle2' | 'overpay1' | 'overpay2';
        sellIndex: number;
        buyAll?: number; 
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
type Faction = 'strength' | 'intelligence' | 'agility' | 'universal';
interface CustomerInstance {
    uid: string;   
    defId: string; //顾客的模板定义 ID 如 "npc_dota_hero_axe"
    entityIndex: EntityIndex;    // Dota单位索引
    playerID: number;              // 归属玩家
    faction: Faction;                          // 派系，从英雄属性自动判断
    state: 'spawning' | 'walking' | 'atCounter' | 'negotiating' | 'done' | 'leaving';
    bag: ItemInstance[]; /** 顾客携带的所有物品（可以多件） */
    activeSellIndex: number; /**当前正在交易的物品在 bag 里的索引，-1 表示没有 */
    buyInterest: string[]; // 顾客想买的物品类型（如'weapon' | 'armor' | 'potion'）
    /** 顾客想买的具体物品（未来用，现在不填） */
    buyRequest?: {
        itemUid: string;
        itemDefId: string;
        offerPrice: number;
    };
    offerPrice?: number;     // 当前出价
    reputationDelta: number; // 本次交易后好感度变化
    hasTriedQueue?: boolean;   // 是否已经尝试过推进队列
}
type CustomerPersonality = 'greedy' | 'cautious' | 'generous' | 'desperate';

interface CustomerDef {
  heroName: string;           // Dota英雄名，如'npc_dota_hero_axe'
  displayName: string;        // 显示给玩家的顾客名称（如“流浪剑客”、“神秘商人”）
  personality: CustomerPersonality;  // 顾客性格类型，影响议价、等待时间等行为（如'greedy' | 'generous' | 'patient'）
  faction: string;            // 顾客所属阵营/派系，用于解锁特殊交易或剧情线（如'radiant' | 'dire' | 'neutral'）
  initialOfferItems: string[]; // 带来的物品defId列表
  buyInterest: string[];      // 想买的物品类型（如'weapon' | 'armor' | 'potion'）
  maxBagSize?: number;   // 顾客最多带几件，默认 3
}

