// // content/panorama/src/components/CustomerCard.tsx
// import React, { useState } from 'react';
// import { CustomerInstance } from 'shared/types';
// import OfferSlider from './OfferSlider';

// /** 组件属性类型 */
// interface Props {
//   customer: CustomerInstance;
//   onOfferSubmit: (customerId: string, price: number) => void;
// }

// /**
//  * 顾客卡片组件
//  * 显示：头像、名称、性格、耐心条、携带物品、出价按钮
//  */
// const CustomerCard: React.FC<Props> = ({ customer, onOfferSubmit }: Props) => {
//   const [showSlider, setShowSlider] = useState<boolean>(false);

//   /** 耐心值百分比（0~100） */
//   const patiencePercent: number = Math.round(customer.patience * 100);

//   return (
//     <div className={`customer-card state-${customer.state}`}>
//       {/* 顾客头部信息 */}
//       <div className="customer-header">
//         <div className="customer-avatar">
//           {/* 实际应使用英雄头像图片，此处用 emoji 占位 */}
//           <span role="img" aria-label="顾客">🧑‍🦰</span>
//         </div>
//         <div className="customer-info">
//           <span className="customer-name">{customer.defId}</span>
//           <span className="customer-personality">性格: {customer.personality}</span>
//         </div>
//       </div>

//       {/* 耐心条 */}
//       <div className="patience-bar">
//         <div
//           className="patience-fill"
//           style={{ width: `${patiencePercent}%` }}
//         />
//         <span className="patience-text">{patiencePercent}%</span>
//       </div>

//       {/* 携带物品（如果有） */}
//       {customer.currentItemForSale && (
//         <div className="offered-item">
//           <span>出售: {customer.currentItemForSale.defId}</span>
//           <span>成色: {(customer.currentItemForSale.condition * 100).toFixed(0)}%</span>
//         </div>
//       )}

//       {/* 操作按钮 */}
//       <div className="customer-actions">
//         <button onClick={() => setShowSlider(!showSlider)}>
//           {showSlider ? '收起出价' : '出价'}
//         </button>
//         <button onClick={() => onOfferSubmit(customer.uid, customer.offerPrice || 0)}>
//           接受报价 ({customer.offerPrice || '?'})
//         </button>
//       </div>

//       {/* 报价滑块（展开时显示） */}
//       {showSlider && (
//         <OfferSlider
//           min={0}
//           max={500}
//           defaultValue={customer.offerPrice || 100}
//           onSubmit={(price: number) => {
//             onOfferSubmit(customer.uid, price);
//             setShowSlider(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default CustomerCard;