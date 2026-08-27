// 可插拔数据源 —— mock 实现
// 实现 PriceSource 接口：getPrice(parsedNeed) -> PriceQuote[]
// 真实数据源接入后，此文件可整体替换或并存

const DB = require("../db");

async function getPrice(parsedNeed) {
  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 400));
  // 按 keywords 匹配商品
  const kws = parsedNeed.keywords || [];
  let matched = DB.products.filter(p =>
    kws.some(k => p.name.toLowerCase().includes(k.toLowerCase()) || p.category.toLowerCase().includes(k.toLowerCase()))
  );
  if (matched.length === 0) matched = DB.products.slice(0, 3);
  return matched.map(p => ({
    productId: p.id,
    productName: p.name,
    category: p.category,
    spec: p.spec,
    image: p.image,
    unit: p.unit,
    moq: p.moq,
    platforms: p.platforms,
    history: p.history
  }));
}

async function getById(productId) {
  await new Promise(r => setTimeout(r, 200));
  return DB.products.find(p => p.id === productId) || null;
}

module.exports = { key: "mock", getPrice, getById };
