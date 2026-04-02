const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeNumber } = require("../src/providers/utils");
const { _internal } = require("../src/providers/ptt");

test("normalizeNumber handles empty and comma separated values", () => {
  assert.equal(normalizeNumber("1,234.50"), 1234.5);
  assert.equal(normalizeNumber(""), null);
  assert.equal(normalizeNumber(null), null);
});

test("mapJsonItems normalizes provider payloads into dashboard rows", () => {
  const rows = _internal.mapJsonItems([
    { name: "Blue Diesel", today: "31.94", tomorrow: "32.44", change: "0.50" }
  ]);

  assert.deepEqual(rows, [
    {
      name: "Blue Diesel",
      unit: "บาท/ลิตร",
      priceToday: 31.94,
      priceTomorrow: 32.44,
      delta: 0.5,
      icon: null
    }
  ]);
});

test("parseHtmlTable extracts rows from simple price tables", () => {
  const rows = _internal.parseHtmlTable(`
    <table>
      <tr><th>ชนิดน้ำมัน</th><th>วันนี้</th><th>พรุ่งนี้</th></tr>
      <tr><td>Gasohol 95</td><td>42.25</td><td>42.75</td></tr>
    </table>
  `);

  assert.deepEqual(rows, [
    {
      name: "Gasohol 95",
      unit: "บาท/ลิตร",
      priceToday: 42.25,
      priceTomorrow: 42.75,
      delta: 0.5,
      icon: null
    }
  ]);
});
