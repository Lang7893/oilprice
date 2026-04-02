const { normalizeNumber, requestText, requestJson } = require("./utils");

const PTT_URL = process.env.PTT_API_URL || "";

function mapJsonItems(input) {
  const list = Array.isArray(input)
    ? input
    : Array.isArray(input?.items)
      ? input.items
      : Array.isArray(input?.data)
        ? input.data
        : [];

  return list
    .map((item) => {
      const name = item.name || item.product || item.fuel || item.title || item.OilName;
      const priceToday = normalizeNumber(
        item.priceToday ?? item.today ?? item.price ?? item.currentPrice ?? item.PriceToday
      );
      const priceTomorrow = normalizeNumber(
        item.priceTomorrow ?? item.tomorrow ?? item.nextPrice ?? item.PriceTomorrow ?? priceToday
      );

      if (!name || priceToday === null) {
        return null;
      }

      return {
        name,
        unit: item.unit || "บาท/ลิตร",
        priceToday,
        priceTomorrow,
        delta: normalizeNumber(item.delta ?? item.change ?? item.PriceDifTomorrow) ?? 0,
        icon: item.icon || item.image || null
      };
    })
    .filter(Boolean);
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseHtmlTable(html) {
  const rowMatches = [...html.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)];
  const items = [];

  for (const [, rowHtml] of rowMatches) {
    const cellMatches = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) =>
      stripTags(match[1])
    );

    if (cellMatches.length < 2) {
      continue;
    }

    const valueCells = cellMatches.slice(1);
    const priceCandidates = valueCells
      .map((cell) => normalizeNumber(cell.replace(/[^\d.-]/g, "")))
      .filter((value) => value !== null);

    if (!priceCandidates.length) {
      continue;
    }

    items.push({
      name: cellMatches[0],
      unit: "บาท/ลิตร",
      priceToday: priceCandidates[0],
      priceTomorrow: priceCandidates[1] ?? priceCandidates[0],
      delta: priceCandidates[1] !== undefined ? Number((priceCandidates[1] - priceCandidates[0]).toFixed(2)) : 0,
      icon: null
    });
  }

  return items;
}

async function loadPttItems(url) {
  if (url.toLowerCase().endsWith(".json")) {
    return mapJsonItems(await requestJson(url));
  }

  const text = await requestText(url);

  try {
    return mapJsonItems(JSON.parse(text));
  } catch {
    return parseHtmlTable(text);
  }
}

async function getPttPrices() {
  if (!PTT_URL) {
    return {
      id: "ptt",
      name: "PTT / OR",
      status: "pending",
      sourceUrl: null,
      updatedAt: null,
      note: "Set PTT_API_URL to the official PTT/OR endpoint or embeddable page when you have it.",
      items: []
    };
  }

  try {
    const items = await loadPttItems(PTT_URL);

    if (!items.length) {
      throw new Error("PTT source responded, but no price rows could be parsed.");
    }

    return {
      id: "ptt",
      name: "PTT / OR",
      status: "ok",
      sourceUrl: PTT_URL,
      updatedAt: new Date().toISOString(),
      note: "Parsed from configured PTT source.",
      items
    };
  } catch (error) {
    return {
      id: "ptt",
      name: "PTT / OR",
      status: "error",
      sourceUrl: PTT_URL,
      updatedAt: null,
      note: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

module.exports = {
  getPttPrices,
  _internal: {
    mapJsonItems,
    parseHtmlTable
  }
};
