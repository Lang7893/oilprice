const { requestJson, normalizeNumber } = require("./utils");

const GOLD_URL = process.env.GOLD_API_URL || "https://www.goldtraders.or.th/api/GoldPrices/details?readjson=false";

function mapGoldRows(record) {
  return [
    {
      name: "ทองคำแท่ง 96.5%",
      unit: "บาท/บาททองคำ",
      primaryValue: normalizeNumber(record.bL_BuyPrice),
      secondaryValue: normalizeNumber(record.bL_SellPrice),
      delta: normalizeNumber(record.priceChangeFromPrevRow)
    },
    {
      name: "ทองรูปพรรณ 96.5%",
      unit: "บาท/บาททองคำ",
      primaryValue: normalizeNumber(record.oM965_BuyPrice),
      secondaryValue: normalizeNumber(record.oM965_SellPrice),
      delta: normalizeNumber(record.priceChangeFromPrevRow)
    },
    {
      name: "ทองคำ 99.99%",
      unit: "บาท/บาททองคำ",
      primaryValue: normalizeNumber(record.oM9999_BuyPrice),
      secondaryValue: normalizeNumber(record.oM9999_BuyPrice),
      delta: normalizeNumber(record.priceChangeFromPrevRow)
    },
    {
      name: "Gold Spot / USDTHB",
      unit: "USD/Oz | THB/USD",
      primaryValue: normalizeNumber(record.goldSpot),
      secondaryValue: normalizeNumber(record.bahtPerUSD),
      delta: normalizeNumber(record.priceChangeFromPrevDayLast)
    }
  ];
}

async function getGoldPrices() {
  try {
    const payload = await requestJson(GOLD_URL);
    const latest = Array.isArray(payload) && payload.length ? payload[payload.length - 1] : payload;

    return {
      id: "gold",
      name: "Gold Traders Association",
      status: "ok",
      sourceUrl: GOLD_URL,
      updatedAt: latest?.asTime || null,
      note: latest
        ? `ประกาศครั้งที่ ${latest.seq} วันที่ ${latest.asTime}`
        : "ไม่พบข้อมูลราคาทองคำ",
      fieldLabels: {
        primary: "รับซื้อ",
        secondary: "ขายออก/อ้างอิง",
        delta: "เปลี่ยนแปลง"
      },
      items: mapGoldRows(latest)
    };
  } catch (error) {
    return {
      id: "gold",
      name: "Gold Traders Association",
      status: "error",
      sourceUrl: GOLD_URL,
      updatedAt: null,
      note: error instanceof Error ? error.message : "Unknown error",
      fieldLabels: {
        primary: "รับซื้อ",
        secondary: "ขายออก/อ้างอิง",
        delta: "เปลี่ยนแปลง"
      },
      items: []
    };
  }
}

module.exports = {
  getGoldPrices,
  _internal: {
    mapGoldRows
  }
};
