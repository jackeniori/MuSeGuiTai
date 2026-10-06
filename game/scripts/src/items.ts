// game/scripts/src/modules/items.ts
interface ItemDef {
    /** 唯一 ID，如 'iron_sword' */
    id: string;
    /** 显示名称，如 '铁剑' */
    name: string;
    /** 物品类别，用于顾客需求匹配 */
    type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
    /** 基准价（银币） */
    basePrice: number;
    /** 最低成色 0.0 ~ 1.0 */
    minCondition: number;
    /** 最高成色 0.0 ~ 1.0 */
    maxCondition: number;
    /** 稀有度 */
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    /** 图标 key，复用 Dota2 物品图标 */
    iconKey: string;
    /** 描述（可选） */
    description?: string;
}
/** 物品定义库 */
export const ITEM_DEFS: ItemDef[] = [
    // ========== 武器 ==========
    { id: 'iron_sword',       name: '铁剑',     type: 'weapon', basePrice: 120,  minCondition: 0.3, maxCondition: 0.9, rarity: 'common',    iconKey: 'item_iron_branch' },
    { id: 'steel_blade',      name: '钢刃',     type: 'weapon', basePrice: 250,  minCondition: 0.4, maxCondition: 0.95, rarity: 'uncommon', iconKey: 'item_phase_boots' },
    { id: 'enchanted_rapier', name: '附魔细剑', type: 'weapon', basePrice: 800,  minCondition: 0.5, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_bfury' },
    { id: 'dragonfang_dagger',name: '龙牙匕首', type: 'weapon', basePrice: 1500, minCondition: 0.6, maxCondition: 1.0, rarity: 'legendary',iconKey: 'item_blink' },
    { id: 'rusty_axe',        name: '锈斧',     type: 'weapon', basePrice: 90,   minCondition: 0.1, maxCondition: 0.5, rarity: 'common',    iconKey: 'item_quelling_blade' },

    // ========== 护甲 ==========
    { id: 'leather_vest',  name: '皮甲',     type: 'armor', basePrice: 80,  minCondition: 0.2, maxCondition: 0.8, rarity: 'common',    iconKey: 'item_ring_of_protection' },
    { id: 'chainmail',     name: '锁子甲',   type: 'armor', basePrice: 350, minCondition: 0.3, maxCondition: 0.9, rarity: 'uncommon', iconKey: 'item_chainmail' },
    { id: 'mithril_plate', name: '秘银板甲', type: 'armor', basePrice: 900, minCondition: 0.5, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_platemail' },

    // ========== 饰品 ==========
    { id: 'copper_ring',   name: '铜戒指',   type: 'accessory', basePrice: 40,  minCondition: 0.1, maxCondition: 0.7, rarity: 'common',    iconKey: 'item_ring_of_regen' },
    { id: 'silver_amulet', name: '银项链',   type: 'accessory', basePrice: 180, minCondition: 0.3, maxCondition: 0.85,rarity: 'uncommon', iconKey: 'item_sobi_mask' },
    { id: 'ruby_orb',      name: '红宝石球', type: 'accessory', basePrice: 600, minCondition: 0.4, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_ultimate_orb' },

    // ========== 消耗品 ==========
    { id: 'healing_potion', name: '治疗药膏', type: 'consumable', basePrice: 60,  minCondition: 0.8, maxCondition: 1.0, rarity: 'common',    iconKey: 'item_flask' },
    { id: 'mana_crystal',   name: '魔力水晶', type: 'consumable', basePrice: 140, minCondition: 0.7, maxCondition: 1.0, rarity: 'uncommon', iconKey: 'item_magic_stick' },
    { id: 'scroll_of_wisdom',name:'智慧卷轴', type: 'consumable', basePrice: 100, minCondition: 0.6, maxCondition: 1.0, rarity: 'common',    iconKey: 'item_tome_of_knowledge' },

    // ========== 材料 ==========
    { id: 'iron_ore',       name: '铁矿石',   type: 'material', basePrice: 15,  minCondition: 0.5, maxCondition: 1.0, rarity: 'common',    iconKey: 'item_iron_branch' },
    { id: 'magic_dust',     name: '魔法粉尘', type: 'material', basePrice: 45,  minCondition: 0.6, maxCondition: 1.0, rarity: 'uncommon', iconKey: 'item_magic_stick' },
    { id: 'phoenix_feather',name: '凤凰羽毛', type: 'material', basePrice: 300, minCondition: 0.8, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_hyperstone' },

    // ========== 更多填充 ==========
    { id: 'wooden_shield', name: '木盾',     type: 'armor',      basePrice: 60,  minCondition: 0.2, maxCondition: 0.7, rarity: 'common',    iconKey: 'item_stout_shield' },
    { id: 'iron_helmet',   name: '铁头盔',   type: 'armor',      basePrice: 200, minCondition: 0.3, maxCondition: 0.9, rarity: 'uncommon', iconKey: 'item_helm_of_iron_will' },
    { id: 'leather_boots', name: '皮靴',     type: 'accessory',  basePrice: 100, minCondition: 0.2, maxCondition: 0.8, rarity: 'common',    iconKey: 'item_boots' },
    { id: 'amber_ring',    name: '琥珀戒指', type: 'accessory',  basePrice: 300, minCondition: 0.4, maxCondition: 0.9, rarity: 'uncommon', iconKey: 'item_ring_of_basilius' },
    { id: 'shadow_cloak',  name: '暗影斗篷', type: 'armor',      basePrice: 700, minCondition: 0.5, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_cloak_of_flames' },
    { id: 'flame_blade',   name: '烈焰之刃', type: 'weapon',     basePrice: 1200,minCondition: 0.6, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_radiance' },
    { id: 'frost_staff',   name: '寒冰法杖', type: 'weapon',     basePrice: 1100,minCondition: 0.5, maxCondition: 1.0, rarity: 'rare',     iconKey: 'item_shivas_guard' },
    { id: 'ancient_relic', name: '远古遗物', type: 'accessory',  basePrice: 2000,minCondition: 0.7, maxCondition: 1.0, rarity: 'legendary',iconKey: 'item_refresher' },
];

/** 按 id 查表 */
const ITEM_MAP: Record<string, ItemDef> = ITEM_DEFS.reduce(
    (acc, def) => { acc[def.id] = def; return acc; },
    {} as Record<string, ItemDef>
);

/** 根据 id 获取物品定义 */
export function getItemDef(id: string): ItemDef | undefined {
    return ITEM_MAP[id];
}

/** 按类别筛选物品定义 */
export function getItemDefsByType(type: ItemDef['type']): ItemDef[] {
    return ITEM_DEFS.filter(d => d.type === type);
}

/** 按稀有度筛选 */
export function getItemDefsByRarity(rarity: ItemDef['rarity']): ItemDef[] {
    return ITEM_DEFS.filter(d => d.rarity === rarity);
}

/** 随机取一个物品定义 */
export function rollRandomItemDef(): ItemDef {
    return ITEM_DEFS[RandomInt(0, ITEM_DEFS.length - 1)];
}