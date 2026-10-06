// // content/panorama/src/components/ItemCard.tsx
// import React from 'react';
// import { ItemInstance } from 'shared/types';

// /** 组件属性类型 */
// interface Props {
//   item: ItemInstance | null;
// }

// /**
//  * 物品卡片组件
//  * 显示：图标、名称、成色、鉴定状态
//  */
// const ItemCard: React.FC<Props> = ({ item }: Props) => {
//   if (!item) {
//     return <div className="item-card empty">空</div>;
//   }

//   const conditionPercent: number = Math.round(item.condition * 100);
//   const identifiedText: string = item.isIdentified ? '已鉴定' : '未鉴定';

//   return (
//     <div className="item-card">
//       <div className="item-icon">
//         {/* 实际应使用物品图标，此处用 emoji 占位 */}
//         <span role="img" aria-label="物品">📦</span>
//       </div>
//       <div className="item-details">
//         <span className="item-name">{item.defId}</span>
//         <span className="item-condition">成色: {conditionPercent}%</span>
//         <span className="item-identified">{identifiedText}</span>
//       </div>
//     </div>
//   );
// };

// export default ItemCard;