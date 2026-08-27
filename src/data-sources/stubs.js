// 预留接入位 —— 5 个联盟/聚合数据源
// 当前为 stub：实现接口契约，返回提示信息。
// 接入真实 API 时，在此文件各函数内填充调用逻辑，业务层（routes）零改动。

function notImpl(name) {
  const err = new Error(`数据源「${name}」尚未接入真实 API。请在 stubs.js 中实现，或在 .env 设置 DATA_SOURCE=mock`);
  err.code = "SOURCE_NOT_IMPL";
  return err;
}

// 接入位 1：淘宝联盟
async function taobao(parsedNeed) {
  if (!process.env.TAOBAO_APP_KEY) throw notImpl("淘宝联盟");
  // TODO: 调用淘宝联盟 API，返回 PriceQuote[]
  // const res = await fetch(`https://eco.taobao.com/router/rest?app_key=${process.env.TAOBAO_APP_KEY}&...`);
  throw notImpl("淘宝联盟");
}

// 接入位 2：京东联盟
async function jd(parsedNeed) {
  if (!process.env.JD_APP_KEY) throw notImpl("京东联盟");
  throw notImpl("京东联盟");
}

// 接入位 3：多多进宝（拼多多）
async function pdd(parsedNeed) {
  if (!process.env.PDD_APP_KEY) throw notImpl("多多进宝");
  throw notImpl("多多进宝");
}

// 接入位 4：1688 开放平台
async function alibaba1688(parsedNeed) {
  if (!process.env.ALI1688_APP_KEY) throw notImpl("1688开放平台");
  throw notImpl("1688开放平台");
}

// 接入位 5：第三方聚合（备选，一次性取多平台）
async function aggregate(parsedNeed) {
  if (!process.env.AGGREGATE_API_KEY) throw notImpl("第三方聚合");
  throw notImpl("第三方聚合");
}

module.exports = { taobao, jd, pdd, alibaba1688, aggregate };
