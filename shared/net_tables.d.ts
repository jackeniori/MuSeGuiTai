declare interface CustomNetTableDeclarations {
    game_timer: {
        game_timer: {
            current_time: number;
            current_state: 1 | 2 | 3 | 4 | 5;
            current_round: number;
        };
    };
    hero_list: {
        hero_list: Record<string, string> | string[];
    };
    custom_net_table_1: {
        key_1: number;
        key_2: string;
    };
    custom_net_table_3: {
        key_1: number;
        key_2: string;
    };
    tc_customer_arrived: {
        uid: string;
    };
    tc_customer_left: {
        uid: string;
    };
    tc_player: {
        [key: string]: {
            day: number;
            phase: string;
            cash: number;
            rent: number;
            factionRelations: Record<string, { favor: number; level: number; unlocked: boolean }>;
            heroRelations: Record<string, { favor: number; tradeCount: number; totalTradeAmount: number }>; 
            inventory: string;  // JSON 字符串，表示玩家的物品栏
        };
    };
}
