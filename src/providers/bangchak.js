const { normalizeNumber, safeJsonParse, requestJson } = require("./utils");

const BANGCHAK_URL = process.env.BANGCHAK_API_URL || "https://oil-price.bangchak.co.th/ApiOilPrice2/th";

async function getBangchakPrices() {
  try {
    const payload = await requestJson(BANGCHAK_URL);
    const record = Array.isArray(payload) ? payload[0] : payload;
    const oils = safeJsonParse(record?.OilList, []);

    return {
      id: "bangchak",
      name: "Bangchak",
      status: "ok",
      sourceUrl: BANGCHAK_URL,
      updatedAt: record?.OilRemark2 || record?.OilDateNow || null,
      note: record?.OilRemark || null,
      items: oils.map((item) => ({
        name: item.OilName || "Unknown",
        unit: "บาท/ลิตร",
        priceToday: normalizeNumber(item.PriceToday),
        priceTomorrow: normalizeNumber(item.PriceTomorrow),
        delta: normalizeNumber(item.PriceDifTomorrow),
        icon: item.IconWeb3 || item.Icon || null
      }))
    };
  } catch (error) {
    return {
      id: "bangchak",
      name: "Bangchak",
      status: "error",
      sourceUrl: BANGCHAK_URL,
      updatedAt: null,
      note: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

module.exports = {
  getBangchakPrices
};
