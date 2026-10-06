import { getState } from "./state";
import { tryServeNextCustomer } from "./modules/queueManager";

/** 计算两点二维距离 */
function dist2D(a: Vector, b: Vector): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
export function startCustomerAI(customer: CustomerInstance): void {
  // 使用 GameRules 定时器检查状态
  Timers.CreateTimer((): number | undefined => {
    if (customer.state === 'leaving' || customer.state === 'done') return; // 停止
      let ent:CDOTA_BaseNPC;
      const handle: CBaseEntity = EntIndexToHScript(customer.entityIndex);
      if (!handle || !handle.IsBaseNPC()) {
        return -1; // 实体无效或非NPC，下一帧重试
      }
      ent = handle;
      const origin: Vector = ent.GetOrigin();
        switch (customer.state) {
            case 'walking': {
                // 1. 先判断是否到达柜台
                const counterEnt = Entities.FindByName(null, 'tc_counter_point');
                if (counterEnt) {
                    const counterPos = counterEnt.GetAbsOrigin();
                    if (dist2D(origin, counterPos) < 64) {
                      print('[暮色柜台] 顾客到达柜台，进入谈判状态');
                        customer.state = 'atCounter';
                        CustomGameEventManager.Send_ServerToAllClients(
                            'tc_customer_arrived',
                            {
                                uid: customer.uid,
                                defId: customer.defId,
                                itemDefId: customer.currentItemForSale?.defId ?? '',
                                condition: customer.currentItemForSale?.condition ?? 0,
                                isIdentified: customer.currentItemForSale?.isIdentified ?? false,
                                buyInterest: customer.buyInterest ?? '',
                                offerPrice: customer.offerPrice ?? 0,
                            }
                        );
                        return 0.25;
                    }
                }

                // 2. 再判断是否到达等待区，到了就尝试推进队列
                const waitEnt = Entities.FindByName(null, 'tc_wait_point');
                if (waitEnt) {
                    const waitPos = waitEnt.GetAbsOrigin();
                    if (dist2D(origin, waitPos) < 100) {
                      print('[暮色柜台] 顾客到达等待区，尝试推进队列');
                        tryServeNextCustomer();
                    }
                }
                break;
            }

            case 'atCounter':
                break;

            case 'negotiating':
                break;

            default:
                break;
        }
        return 0.25;   // 【关键】每次 tick 都返回 0.25，定时器持续运行
  });
}

export function onPlayerRespond(customerUid: string, accepted: boolean): void {
  const cust = getState().currentCustomerQueue.find(c => c.uid === customerUid);
  if (!cust) return;
  if (accepted) {
    cust.state = 'done';
    // 触发交易完成逻辑
  } else {
    cust.state = 'leaving';
      let ent:CDOTA_BaseNPC;
      const handle: CBaseEntity = EntIndexToHScript(cust.entityIndex);
      if(handle && handle.IsBaseNPC()){
        ent = handle;
      }
      if (ent) ent.MoveToPosition(Vector(-200,0,128));
  }
}