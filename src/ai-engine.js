// AI 双兼容引擎
// 模式 A：大模型 API（填了 LLM_API_KEY 时启用，真实 fetch 调用）
// 模式 B：规则解析（无 Key 或调用失败时自动降级）
// 两模式输出同一结构，下游 data-sources 无感知

const DICT = [
  { kw: ["保温杯","水杯","杯子"], cat: "日用品/保温杯", spec: "304不锈钢 500ml" },
  { kw: ["耳机","蓝牙"], cat: "数码电子/耳机", spec: "无线降噪 入耳式" },
  { kw: ["笔","中性笔"], cat: "办公用品/笔", spec: "定制logo 中性笔" },
  { kw: ["袋","帆布","手提袋"], cat: "包装用品/袋", spec: "定制印花 帆布" },
  { kw: ["数据线","type-c","充电线"], cat: "数码电子/数据线", spec: "Type-C 6A 尼龙编织" },
  { kw: ["纸箱","快递盒","包装盒"], cat: "包装用品/纸箱", spec: "加厚瓦楞 定制尺寸" }
];

// 规则解析（模式 B）
function ruleParse(prompt) {
  const lower = (prompt || "").toLowerCase();
  let hit = DICT.find(d => d.kw.some(k => lower.includes(k)));
  if (!hit) hit = DICT[0];
  const qtyMatch = prompt.match(/(\d+)\s*(个|副|支|条|件|箱)/);
  const budgetMatch = prompt.match(/(\d+(?:\.\d+)?)\s*元/);
  return {
    category: hit.cat,
    spec: hit.spec,
    quantity: qtyMatch ? parseInt(qtyMatch[1]) : 100,
    budget: budgetMatch ? parseFloat(budgetMatch[1]) : null,
    keywords: hit.kw
  };
}

// 大模型解析（模式 A）—— OpenAI 兼容格式，支持豆包/通义/DeepSeek/OpenAI 等
async function llmParse(prompt, apiKey) {
  const base = process.env.LLM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const model = process.env.LLM_MODEL || "doubao-pro-32k";
  const sys = "你是采购需求解析器。把用户的采购需求解析成JSON，字段：category(品类路径如 日用品/保温杯)、spec(规格简述)、quantity(数量数字)、budget(单件预算数字或null)、keywords(检索词数组)。只输出JSON，不要解释，不要markdown代码块。";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt }
      ],
      temperature: 0
    })
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  // 容错：模型可能带 ```json 包裹
  const jsonStr = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(jsonStr);
  return {
    category: parsed.category || "",
    spec: parsed.spec || "",
    quantity: parsed.quantity || 100,
    budget: parsed.budget || null,
    keywords: parsed.keywords || []
  };
}

// 引擎入口：自动选择模式，失败降级
async function parse(prompt) {
  const apiKey = process.env.LLM_API_KEY;
  // 模式 A：有 Key 走大模型
  if (apiKey) {
    try {
      const r = await llmParse(prompt, apiKey);
      return { ...r, source: "llm", mode: "A", note: "大模型解析，语义容错更强" };
    } catch (e) {
      // 容错降级：大模型调用失败则走规则
      return { ...ruleParse(prompt), source: "rule(fallback)", mode: "B", note: `大模型调用失败，降级规则解析：${e.message}` };
    }
  }
  // 模式 B：无 Key 走规则
  return { ...ruleParse(prompt), source: "rule", mode: "B", note: "无 Key，规则降级解析（品类词典+正则）" };
}

module.exports = { parse, ruleParse, llmParse };
