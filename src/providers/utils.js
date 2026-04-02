async function requestText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "oilprice-dashboard/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed with ${response.status}`);
  }

  return response.text();
}

async function requestJson(url) {
  const text = await requestText(url);
  return JSON.parse(text);
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseFloat(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function safeJsonParse(input, fallback) {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

module.exports = {
  normalizeNumber,
  safeJsonParse,
  requestText,
  requestJson
};
