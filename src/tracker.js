const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "analytics.json");

const STORE = { events: [], feedback: [], sessionStart: new Date().toISOString() };

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      if (raw.events) STORE.events = raw.events;
      if (raw.feedback) STORE.feedback = raw.feedback;
    }
  } catch {}
}
load();

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ events: STORE.events, feedback: STORE.feedback }));
    } catch {}
  }, 2000);
}

function track(event) {
  const entry = {
    id: "EV" + Date.now() + Math.random().toString(36).slice(2, 6),
    event: event.event || "unknown",
    page: event.page || null,
    detail: event.detail || null,
    timestamp: new Date().toISOString()
  };
  STORE.events.push(entry);
  if (STORE.events.length > 5000) STORE.events = STORE.events.slice(-3000);
  scheduleSave();
  return entry;
}

function addFeedback(fb) {
  const entry = {
    id: "FB" + Date.now(),
    type: fb.type || "suggestion",
    content: fb.content || "",
    contact: fb.contact || "",
    rating: fb.rating || null,
    page: fb.page || null,
    status: "open",
    timestamp: new Date().toISOString()
  };
  STORE.feedback.unshift(entry);
  if (STORE.feedback.length > 500) STORE.feedback = STORE.feedback.slice(0, 500);
  scheduleSave();
  return entry;
}

function getAnalytics() {
  const events = STORE.events;
  const byEvent = {};
  const byPage = {};

  for (const ev of events) {
    byEvent[ev.event] = (byEvent[ev.event] || 0) + 1;
    if (ev.page) byPage[ev.page] = (byPage[ev.page] || 0) + 1;
  }

  const searches = events.filter(e => e.event === "chat_search").map(e => ({
    query: e.detail?.prompt || "",
    time: e.timestamp,
    resultCount: e.detail?.resultCount ?? null,
    mode: e.detail?.mode || null,
    category: e.detail?.category || null
  }));

  const pageViews = byEvent.page_view || 0;
  const searchCount = byEvent.chat_search || 0;
  const compareCount = byEvent.view_compare || 0;
  const historyCount = byEvent.view_history || 0;
  const alertCount = byEvent.alert_create || 0;

  const sessions = new Set(events.map(e => e.detail?.sessionId).filter(Boolean));

  const searchGaps = searches
    .filter(s => s.resultCount === 0 || s.resultCount === null)
    .map(s => ({ query: s.query, category: s.category, time: s.time }));

  const matchedSearches = searches.filter(s => s.resultCount > 0);
  const categoryFreq = {};
  for (const s of searches) {
    if (s.category) categoryFreq[s.category] = (categoryFreq[s.category] || 0) + 1;
  }

  const fbByType = {};
  let ratingSum = 0, ratingCount = 0;
  for (const f of STORE.feedback) {
    fbByType[f.type] = (fbByType[f.type] || 0) + 1;
    if (f.rating) { ratingSum += f.rating; ratingCount++; }
  }

  const searchTrend = {};
  for (const s of searches) {
    const day = (s.time || "").slice(0, 10);
    searchTrend[day] = (searchTrend[day] || 0) + 1;
  }

  return {
    summary: {
      totalEvents: events.length,
      totalSessions: sessions.size || 1,
      uptime: Math.round((Date.now() - new Date(STORE.sessionStart).getTime()) / 1000),
      feedbackCount: STORE.feedback.length,
      avgRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null
    },
    funnel: {
      pageView: pageViews,
      search: searchCount,
      compare: compareCount,
      history: historyCount,
      alert: alertCount,
      searchRate: pageViews > 0 ? Math.round(searchCount / pageViews * 100) : 0,
      compareRate: searchCount > 0 ? Math.round(compareCount / searchCount * 100) : 0,
      alertRate: compareCount > 0 ? Math.round(alertCount / compareCount * 100) : 0
    },
    byEvent,
    byPage,
    searches: searches.slice(-30),
    topSearches: topKeywords(searches.map(s => s.query)),
    searchGaps: searchGaps.slice(0, 10),
    categoryFreq: Object.entries(categoryFreq).sort((a, b) => b[1] - a[1]).map(([cat, count]) => ({ category: cat, count })),
    searchTrend: Object.entries(searchTrend).sort((a, b) => a[0].localeCompare(b[0])).slice(-14),
    feedback: {
      byType: fbByType,
      avgRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null,
      total: STORE.feedback.length,
      open: STORE.feedback.filter(f => f.status === "open").length,
      list: STORE.feedback.slice(0, 20)
    },
    recentEvents: events.slice(-50).reverse()
  };
}

function topKeywords(queries) {
  const freq = {};
  for (const q of queries) {
    if (!q) continue;
    const words = q.split(/[\s,，、]+/).filter(w => w.length > 1);
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([word, count]) => ({ word, count }));
}

function exportCSV() {
  const rows = [["timestamp", "event", "page", "detail"]];
  for (const ev of STORE.events) {
    const d = ev.detail ? JSON.stringify(ev.detail).replace(/"/g, '""') : "";
    rows.push([ev.timestamp, ev.event, ev.page || "", d]);
  }
  rows.push([]);
  rows.push(["timestamp", "type", "rating", "content", "contact", "status"]);
  for (const f of STORE.feedback) {
    rows.push([f.timestamp, f.type, f.rating || "", f.content.replace(/"/g, '""'), f.contact || "", f.status]);
  }
  return rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
}

module.exports = { track, addFeedback, getAnalytics, exportCSV, STORE };
