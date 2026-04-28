import SetupStuff from "../models/SetupStuff.js";
import StockPurchase from "../models/StockPurchase.js";
import DailyProduction from "../models/DailyProduction.js";
import Sale from "../models/Sale.js";
import RecipeItem from "../models/RecipeItem.js";

const sum = (arr, key) => {
  return arr.reduce((total, item) => total + Number(item[key] || 0), 0);
};

export const getDashboard = async (req, res) => {
  try {
    const { locationId, from, to } = req.query;

    const baseFilter = {};
    if (locationId) baseFilter.location = locationId;

    const dateFilter = {};
    if (from || to) {
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
    }

    const setupFilter = { ...baseFilter };
    const stockFilter = { ...baseFilter };
    const productionFilter = { ...baseFilter };
    const saleFilter = { ...baseFilter };

    if (from || to) {
      setupFilter.purchaseDate = dateFilter;
      stockFilter.purchaseDate = dateFilter;
      productionFilter.date = dateFilter;
      saleFilter.date = dateFilter;
    }

    const [setupStuff, stockPurchases, productions, sales, recipeItems] =
      await Promise.all([
        SetupStuff.find(setupFilter),
        StockPurchase.find(stockFilter),
        DailyProduction.find(productionFilter),
        Sale.find(saleFilter),
        RecipeItem.find(baseFilter),
      ]);

    const totalSetupInvestment = sum(setupStuff, "totalPrice");

    const totalStockPurchased = sum(stockPurchases, "totalPrice");
    const totalStockPaid = sum(stockPurchases, "paidAmount");
    const totalStockPending = totalStockPurchased - totalStockPaid;

    const totalMakingCost = sum(productions, "totalMakingCost");
    const totalPreparedLiters = sum(productions, "totalPreparedLiters");
    const estimatedGlasses = sum(productions, "estimatedGlasses");

    const totalSales = sum(sales, "totalAmount");
    const totalRecovered = sum(sales, "paidAmount");
    const totalPendingFromCustomers = totalSales - totalRecovered;
    const totalExtraReceived = sum(sales, "extraAmount");
    const totalGlassesSold = sum(sales, "glasses");

    const currentStockValue = recipeItems.reduce((total, item) => {
      return total + Number(item.currentStock || 0) * Number(item.pricePerUnit || 0);
    }, 0);

    const totalInvestedTillNow = totalSetupInvestment + totalStockPaid;

    const operationalProfit = totalSales - totalMakingCost;

    const cashProfitLoss = totalRecovered - totalInvestedTillNow;

    const businessProfitLoss =
      totalRecovered + currentStockValue - totalSetupInvestment - totalStockPaid;

    const recoveryPercentage =
      totalInvestedTillNow > 0
        ? ((totalRecovered / totalInvestedTillNow) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      dashboard: {
        totalSetupInvestment,
        totalStockPurchased,
        totalStockPaid,
        totalStockPending,
        totalInvestedTillNow,

        totalMakingCost,
        totalPreparedLiters,
        estimatedGlasses,

        totalSales,
        totalRecovered,
        totalPendingFromCustomers,
        totalExtraReceived,
        totalGlassesSold,

        currentStockValue,

        operationalProfit,
        cashProfitLoss,
        businessProfitLoss,
        recoveryPercentage: Number(recoveryPercentage),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};