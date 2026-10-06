// // content/panorama/src/components/OfferSlider.tsx
// import React, { useState } from 'react';

// /** 组件属性类型 */
// interface Props {
//   min: number;
//   max: number;
//   defaultValue: number;
//   onSubmit: (price: number) => void;
// }

// /**
//  * 报价滑块组件
//  * 允许玩家拖动选择价格，并确认提交
//  */
// const OfferSlider: React.FC<Props> = ({ min, max, defaultValue, onSubmit }: Props) => {
//   const [value, setValue] = useState<number>(defaultValue);

//   return (
//     <div className="offer-slider-container">
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={value}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//           setValue(Number(e.target.value))
//         }
//         className="offer-slider"
//       />
//       <div className="slider-labels">
//         <span>{min}</span>
//         <span className="current-value">{value} 金币</span>
//         <span>{max}</span>
//       </div>
//       <button onClick={() => onSubmit(value)} className="submit-offer-btn">
//         确认出价
//       </button>
//     </div>
//   );
// };

// export default OfferSlider;