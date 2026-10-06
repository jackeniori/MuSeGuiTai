
import { getItemDef } from "./items";

/**
 * 计算物品估值
 */
export function calculateBaseValue(item: ItemInstance): number {
  const def = getItemDef(item.defId);
  if (!def) return 0;

  let value = def.basePrice;
  // 成色影响 ±30%
  value *= (0.7 + 0.6 * item.condition);
  // 稀有度加成
  const rarityMultiplier: Record<string, number> = {
    common: 1.0,
    uncommon: 1.5,
    rare: 2.5,
    legendary: 5.0
  };
  value *= rarityMultiplier[def.rarity] || 1.0;
  return Math.round(value);
}

/**
 * 根据顾客性格调整初始报价
 */
export function getInitialOffer(baseValue: number, personality: CustomerPersonality): number {
  switch (personality) {
    case 'greedy': return Math.floor(baseValue * 0.4);  // 压价
    case 'cautious': return Math.floor(baseValue * 0.65);
    case 'generous': return Math.floor(baseValue * 0.85);
    case 'desperate': return Math.floor(baseValue * 1.1); // 急需钱，愿意高价卖
    default: return Math.floor(baseValue * 0.7);
  }
}

/**
 * 还价逻辑：玩家出价 vs 顾客心理底价
 * @returns { accepted: boolean, finalPrice: number, reaction: string }
 */
export function negotiate(
  playerOffer: number,
  itemValue: number,
  personality: CustomerPersonality,
  patience: number
): { accepted: boolean; finalPrice: number; reaction: string } {
  // 心理底价 = 物品价值 * 性格系数
  const minAcceptRatio: Record<CustomerPersonality, number> = {
    greedy: 0.55,
    cautious: 0.75,
    generous: 0.88,
    desperate: 0.92
  };
  const minPrice = Math.floor(itemValue * minAcceptRatio[personality]);

  if (playerOffer >= minPrice) {
    return { accepted: true, finalPrice: playerOffer, reaction: "成交！" };
  }

  // 拒绝，但根据耐心决定是否生气
  if (patience < 0.3) {
    return { accepted: false, finalPrice: 0, reaction: "你在耍我吗？" };
  } else {
    return { accepted: false, finalPrice: 0, reaction: "太低了，不行。" };
  }
}