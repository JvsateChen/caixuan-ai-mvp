// 采选AI MVP 服务入口 —— 零依赖，纯 Node 内置模块
// 启动：node server.js  →  http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// 手写 .env 加载器（无需 dotenv）
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const routes = require("./src/routes");
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API 路由
  if (pathname.startsWith("/api/")) {
    try {
      const handled = await routes.handle(req, res, parsedUrl);
      if (handled) return;
      return route404(res);
    } catch (e) {
      if (res.headersSent) return res.end();
      return route500(res, e.message);
    }
  }

  // 静态文件
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);
  // 防路径穿越
  if (!filePath.startsWith(PUBLIC_DIR)) return route404(res);

  fs.readFile(filePath, (err, data) => {
    if (err) return route404(res);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

function route404(res) {
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Not Found" }));
}

function route500(res, msg) {
  res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Server Error", detail: msg }));
}

server.listen(PORT, () => {
  const mode = process.env.LLM_API_KEY ? "A（大模型）" : "B（规则降级）";
  console.log(`\n  采选AI MVP 已启动`);
  console.log(`  地址：http://localhost:${PORT}`);
  console.log(`  引擎：模式 ${mode}`);
  console.log(`  数据源：${require("./src/data-sources").currentKey()}\n`);
});
