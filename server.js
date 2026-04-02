const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { getOilPrices } = require("./src/providers");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000);

let cache = {
  expiresAt: 0,
  payload: null
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  };

  return types[ext] || "application/octet-stream";
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function serveStaticFile(requestPath, response) {
  const sanitizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, sanitizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "Not found" });
        return;
      }

      sendJson(response, 500, { error: "Failed to read file" });
      return;
    }

    response.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "public, max-age=300"
    });
    response.end(data);
  });
}

async function getCachedOilPrices(forceRefresh) {
  if (!forceRefresh && cache.payload && Date.now() < cache.expiresAt) {
    return cache.payload;
  }

  const payload = await getOilPrices();
  cache = {
    payload,
    expiresAt: Date.now() + CACHE_TTL_MS
  };
  return payload;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  if (requestUrl.pathname === "/healthz") {
    sendJson(response, 200, { ok: true, uptime: process.uptime() });
    return;
  }

  if (requestUrl.pathname === "/api/prices") {
    try {
      const forceRefresh = requestUrl.searchParams.get("refresh") === "1";
      const payload = await getCachedOilPrices(forceRefresh);
      sendJson(response, 200, payload);
    } catch (error) {
      sendJson(response, 500, {
        error: "Unable to fetch oil prices",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  serveStaticFile(requestUrl.pathname, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Oil price dashboard is running at http://${HOST}:${PORT}`);
});
