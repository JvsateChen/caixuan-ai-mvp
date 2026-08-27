// 可插拔数据源调度器
// 统一接口契约：每个数据源实现 { key, getPrice(parsedNeed) -> PriceQuote[], getById?(id) }
// 切换数据源：改 .env 的 DATA_SOURCE 即可，业务层（routes）零改动

const mock = require("./mock");
const stubs = require("./stubs");

const REGISTRY = {
  mock,
  taobao: { key: "taobao", getPrice: stubs.taobao },
  jd: { key: "jd", getPrice: stubs.jd },
  pdd: { key: "pdd", getPrice: stubs.pdd },
  alibaba1688: { key: "alibaba1688", getPrice: stubs.alibaba1688 },
  aggregate: { key: "aggregate", getPrice: stubs.aggregate }
};

function current() {
  const name = process.env.DATA_SOURCE || "mock";
  return REGISTRY[name] || mock;
}

function currentKey() {
  return current().key;
}

async function getPrice(parsedNeed) {
  return current().getPrice(parsedNeed);
}

async function getById(productId) {
  const src = current();
  return src.getById ? src.getById(productId) : mock.getById(productId);
}

module.exports = { getPrice, getById, current, currentKey, REGISTRY };
