/**
 * 玩家个人商店的完整状态数据
 * 每位玩家拥有独立的 PlayerData 实例，互不干扰
 */
export interface PlayerData {
  /** 当前游戏天数，从 1 开始递增 */
  day: number;
  /**
   * 当前时段
   * - morning: 早晨（准备阶段，可整理库存）
   * - night: 夜晚（黑市营业，高风险高回报）
   */
  phase: 'morning' | 'night';

  /** 当前持有的金币数量，用于进货、支付房租、发放工资等 */
  cash: number;
  /**
   * 各派系的好感度
   * key: 派系名称（如 "工会"、"盗贼公会"、"教会"）
   * value: 好感度数值（正数为友好，负数为敌对）
   */
  reputation: Record<string, number>;
  /**
   * 后台库存（可选字段，若未定义则视为空库存）
   * 每个条目为一个物品堆叠
   */
  inventory?: {
    /** 物品实例，null 表示该堆叠为空 */
    item?: ItemInstance | null;
    /** 该物品的堆叠数量（默认为 1） */
    count?: number;
  };
  /**
   * 展示柜格子数组，固定长度（例如 6 格）
   * 每个格子可以是 ItemInstance 或 null（空格）
   * 展示柜中的物品对顾客可见，可直接参与交易
   */
  displayCase: (ItemInstance | null)[];

  /** 当前雇佣的员工列表 */
  employees: Employee[];

  /**
   * 当前触发的待处理事件列表（可选字段）
   * 每个事件包含类型、难度、描述等信息
   */
  events?: {
    /** 事件唯一标识符 */
    id?: string;
    /**
     * 事件类型
     * - raid: 突击检查（警方或敌对势力）
     * - smuggle: 走私交易（高风险高利润）
     * - dispute: 纠纷（顾客争吵或欺诈）
     * - investigation: 调查（神秘人物探查）
     */
    type?: 'raid' | 'smuggle' | 'dispute' | 'investigation';
    /** 事件难度等级（1~10） */
    difficulty?: number;
    /** 事件的文字描述 */
    description?: string;
    /** 指派处理此事件的员工 ID 列表 */
    assignedEmployeeIds?: string[];
    /** 是否已解决 */
    resolved?: boolean;
    // /** 当前在店外排队等候的顾客队列，按顺序服务 */
    // currentCustomerQueue: CustomerInstance[];

    // /** 当前活跃的委托列表 */
    // activeCommissions: Commission[];
    // /** 已完成的委托历史（可选，用于回顾或成就） */
    // completedCommissions?: Commission[];
  };

}

/** 委托任务 */
export interface Commission {
  /** 委托唯一标识 */
  id: string;
  /** 委托人名称（可能是特定顾客或派系） */
  clientName: string;
  /** 委托描述 */
  description: string;
  /**
   * 委托类型
   * - fetch: 收集指定物品
   * - appraise: 鉴定某件物品
   * - sell: 以不低于指定价格卖出物品
   * - acquire: 收购指定物品
   * - special: 特殊任务（如调查、护送等）
   */
  type: 'fetch' | 'appraise' | 'sell' | 'acquire' | 'special';
  /** 目标详情（如物品ID、数量、金额等） */
  target: {
    /** 目标物品定义ID（如有） */
    itemDefId?: string;
    /** 所需数量 */
    quantity?: number;
    /** 目标金额（如卖价下限） */
    amount?: number;
    /** 其他自定义目标数据 */
    extra?: Record<string, any>;
  };
  /** 奖励（金币、声望、物品等） */
  reward: {
    gold?: number;
    reputation?: Record<string, number>;  // 派系声望奖励
    items?: string[];                     // 奖励物品定义ID
    other?: Record<string, any>;
  };
  /** 接受委托时的游戏天数 */
  acceptedDay: number;
  /** 截止天数（逾期则失败或惩罚） */
  deadlineDay: number;
  /** 当前进度（0~1） */
  progress: number;
  /** 是否已完成 */
  completed: boolean;
  /** 是否已领取奖励 */
  rewarded: boolean;
  /** 是否失败 */
  failed: boolean;
}

export function createDefaultPlayerData(playerID: PlayerID): PlayerData {
    return {
          day: 1,
          phase: 'morning',
          cash: 1000,
          reputation: {},
          inventory: undefined,
          displayCase: null,
          employees: [],
          //currentCustomerQueue: [],
          events: undefined,
         //activeCommissions: [],       // 初始无委托
         // completedCommissions: []     // 初始无完成记录
    };
}
       