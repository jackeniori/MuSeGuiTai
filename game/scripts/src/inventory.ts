// import { ItemInstance, InventorySlot } from 'shared/types';

// /** 生成唯一标识符 */
// function generateUID(): string {
//   const timePart = Time().toString().replace('.', '');
//   const randomPart = Math.floor(RandomInt(10000, 99999)).toString();
//   return `uid_${timePart}_${randomPart}`;
// }

// let inventory: InventorySlot[] = [];

// export function initInventory(size: number = 48): void {
//   inventory = Array.from({ length: size }, () => ({ item: null, count: 0 }));
// }

// export function addItem(itemDefId: string, condition: number): boolean {
//   const slot = inventory.find(s => s.item === null);
//   if (!slot) return false;
//   slot.item = {
//     uid: generateUID(),
//     defId: itemDefId,
//     condition,
//     isIdentified: false
//   };
//   slot.count = 1;
//   return true;
// }

// export function removeItemByUid(uid: string): boolean {
//   const idx = inventory.findIndex(s => s.item?.uid === uid);
//   if (idx === -1) return false;
//   inventory[idx] = { item: null, count: 0 };
//   return true;
// }

// export function getInventory(): InventorySlot[] {
//   return inventory;
// }