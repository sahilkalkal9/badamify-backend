import DailyProduction from "../models/DailyProduction.js";
import RecipeItem from "../models/RecipeItem.js";
import StockPurchase from "../models/StockPurchase.js";

export const getItemId = (item) => item?.toString();

export const getQuantityMap = (items = []) => {
  return items.reduce((map, used) => {
    const itemId = getItemId(used.item);
    if (!itemId) return map;

    const quantity =
      used.quantityUsed !== undefined ? used.quantityUsed : used.quantity;

    map.set(itemId, (map.get(itemId) || 0) + Number(quantity || 0));
    return map;
  }, new Map());
};

export const getInventoryLedger = async (itemIds = []) => {
  const itemFilter = itemIds.length ? { item: { $in: itemIds } } : {};

  const [purchases, productions] = await Promise.all([
    StockPurchase.find(itemFilter),
    DailyProduction.find(itemIds.length ? { "itemsUsed.item": { $in: itemIds } } : {}),
  ]);

  const purchasedQuantities = new Map();
  const consumedQuantities = new Map();
  let purchasedValue = 0;
  let consumedValue = 0;

  for (const purchase of purchases) {
    const itemId = getItemId(purchase.item);
    if (!itemId) continue;

    const quantity = Number(purchase.quantity || 0);
    purchasedQuantities.set(itemId, (purchasedQuantities.get(itemId) || 0) + quantity);
    purchasedValue += Number(purchase.totalPrice || 0);
  }

  for (const production of productions) {
    for (const used of production.itemsUsed || []) {
      const itemId = getItemId(used.item);
      if (!itemId || (itemIds.length && !itemIds.includes(itemId))) continue;

      const quantity = Number(used.quantityUsed || 0);
      consumedQuantities.set(itemId, (consumedQuantities.get(itemId) || 0) + quantity);
      consumedValue += Number(used.cost || 0);
    }
  }

  return {
    purchasedQuantities,
    consumedQuantities,
    purchasedValue,
    consumedValue,
    currentStockValue: purchasedValue - consumedValue,
  };
};

export const reconcileRecipeItemStock = async (itemIds = []) => {
  const uniqueItemIds = [...new Set(itemIds.filter(Boolean).map(String))];
  const filter = uniqueItemIds.length ? { _id: { $in: uniqueItemIds } } : {};
  const items = await RecipeItem.find(filter);
  const ledger = await getInventoryLedger(items.map((item) => item._id.toString()));

  for (const item of items) {
    const itemId = item._id.toString();
    const purchased = Number(ledger.purchasedQuantities.get(itemId) || 0);
    const consumed = Number(ledger.consumedQuantities.get(itemId) || 0);

    item.currentStock = purchased - consumed;
    await item.save();
  }

  return items;
};
