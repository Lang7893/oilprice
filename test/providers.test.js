const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeNumber } = require("../src/providers/utils");
const { _internal } = require("../src/providers/gold");

test("normalizeNumber handles empty and comma separated values", () => {
  assert.equal(normalizeNumber("1,234.50"), 1234.5);
  assert.equal(normalizeNumber(""), null);
  assert.equal(normalizeNumber(null), null);
});

test("mapGoldRows normalizes gold trader payloads into dashboard rows", () => {
  const rows = _internal.mapGoldRows({
    seq: 3,
    asTime: "2026-04-02T09:35:00",
    bL_BuyPrice: 72300,
    bL_SellPrice: 72500,
    oM965_BuyPrice: 70857.84,
    oM965_SellPrice: 73300,
    oM9999_BuyPrice: 73427.76,
    goldSpot: 4665,
    bahtPerUSD: 32.77,
    priceChangeFromPrevRow: -200,
    priceChangeFromPrevDayLast: -400
  });

  assert.deepEqual(rows, [
    {
      name: "ทองคำแท่ง 96.5%",
      unit: "บาท/บาททองคำ",
      primaryValue: 72300,
      secondaryValue: 72500,
      delta: -200
    },
    {
      name: "ทองรูปพรรณ 96.5%",
      unit: "บาท/บาททองคำ",
      primaryValue: 70857.84,
      secondaryValue: 73300,
      delta: -200
    },
    {
      name: "ทองคำ 99.99%",
      unit: "บาท/บาททองคำ",
      primaryValue: 73427.76,
      secondaryValue: 73427.76,
      delta: -200
    },
    {
      name: "Gold Spot / USDTHB",
      unit: "USD/Oz | THB/USD",
      primaryValue: 4665,
      secondaryValue: 32.77,
      delta: -400
    }
  ]);
});
