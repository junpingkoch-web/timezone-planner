// World Meeting Time Planner — timeline drag logic + i18n + persistence.
// No external libraries: relies on Intl.DateTimeFormat for correct, DST-aware
// per-city local time conversion.

const CITY_DB = [
  // Asia-Pacific
  { id: "shanghai", tz: "Asia/Shanghai", en: "Beijing", de: "Peking", zh: "北京", region: "apac" },
  { id: "tokyo", tz: "Asia/Tokyo", en: "Tokyo", de: "Tokio", zh: "东京", region: "apac" },
  { id: "singapore", tz: "Asia/Singapore", en: "Singapore", de: "Singapur", zh: "新加坡", region: "apac" },
  { id: "sydney", tz: "Australia/Sydney", en: "Sydney", de: "Sydney", zh: "悉尼", region: "apac" },
  { id: "mumbai", tz: "Asia/Kolkata", en: "Mumbai", de: "Mumbai", zh: "孟买", region: "apac" },
  { id: "hongkong", tz: "Asia/Hong_Kong", en: "Hong Kong", de: "Hongkong", zh: "香港", region: "apac" },
  { id: "seoul", tz: "Asia/Seoul", en: "Seoul", de: "Seoul", zh: "首尔", region: "apac" },
  { id: "taipei", tz: "Asia/Taipei", en: "Taipei", de: "Taipeh", zh: "台北", region: "apac" },
  { id: "bangkok", tz: "Asia/Bangkok", en: "Bangkok", de: "Bangkok", zh: "曼谷", region: "apac" },
  { id: "jakarta", tz: "Asia/Jakarta", en: "Jakarta", de: "Jakarta", zh: "雅加达", region: "apac" },
  { id: "kualalumpur", tz: "Asia/Kuala_Lumpur", en: "Kuala Lumpur", de: "Kuala Lumpur", zh: "吉隆坡", region: "apac" },
  { id: "manila", tz: "Asia/Manila", en: "Manila", de: "Manila", zh: "马尼拉", region: "apac" },
  { id: "newdelhi", tz: "Asia/Kolkata", en: "New Delhi", de: "Neu-Delhi", zh: "新德里", region: "apac" },
  { id: "auckland", tz: "Pacific/Auckland", en: "Auckland", de: "Auckland", zh: "奥克兰", region: "apac" },
  // Europe
  { id: "london", tz: "Europe/London", en: "London", de: "London", zh: "伦敦", region: "europe" },
  { id: "zurich", tz: "Europe/Zurich", en: "Zurich", de: "Zürich", zh: "苏黎世", region: "europe" },
  { id: "paris", tz: "Europe/Paris", en: "Paris", de: "Paris", zh: "巴黎", region: "europe" },
  { id: "berlin", tz: "Europe/Berlin", en: "Berlin", de: "Berlin", zh: "柏林", region: "europe" },
  { id: "moscow", tz: "Europe/Moscow", en: "Moscow", de: "Moskau", zh: "莫斯科", region: "europe" },
  { id: "frankfurt", tz: "Europe/Berlin", en: "Frankfurt", de: "Frankfurt", zh: "法兰克福", region: "europe" },
  { id: "amsterdam", tz: "Europe/Amsterdam", en: "Amsterdam", de: "Amsterdam", zh: "阿姆斯特丹", region: "europe" },
  { id: "madrid", tz: "Europe/Madrid", en: "Madrid", de: "Madrid", zh: "马德里", region: "europe" },
  { id: "milan", tz: "Europe/Rome", en: "Milan", de: "Mailand", zh: "米兰", region: "europe" },
  { id: "vienna", tz: "Europe/Vienna", en: "Vienna", de: "Wien", zh: "维也纳", region: "europe" },
  { id: "stockholm", tz: "Europe/Stockholm", en: "Stockholm", de: "Stockholm", zh: "斯德哥尔摩", region: "europe" },
  { id: "warsaw", tz: "Europe/Warsaw", en: "Warsaw", de: "Warschau", zh: "华沙", region: "europe" },
  { id: "dublin", tz: "Europe/Dublin", en: "Dublin", de: "Dublin", zh: "都柏林", region: "europe" },
  { id: "brussels", tz: "Europe/Brussels", en: "Brussels", de: "Brüssel", zh: "布鲁塞尔", region: "europe" },
  // Americas
  { id: "newyork", tz: "America/New_York", en: "New York", de: "New York", zh: "纽约", region: "americas" },
  { id: "losangeles", tz: "America/Los_Angeles", en: "Los Angeles", de: "Los Angeles", zh: "洛杉矶", region: "americas" },
  { id: "saopaulo", tz: "America/Sao_Paulo", en: "São Paulo", de: "São Paulo", zh: "圣保罗", region: "americas" },
  { id: "toronto", tz: "America/Toronto", en: "Toronto", de: "Toronto", zh: "多伦多", region: "americas" },
  { id: "chicago", tz: "America/Chicago", en: "Chicago", de: "Chicago", zh: "芝加哥", region: "americas" },
  { id: "sanfrancisco", tz: "America/Los_Angeles", en: "San Francisco", de: "San Francisco", zh: "旧金山", region: "americas" },
  { id: "mexicocity", tz: "America/Mexico_City", en: "Mexico City", de: "Mexiko-Stadt", zh: "墨西哥城", region: "americas" },
  { id: "buenosaires", tz: "America/Argentina/Buenos_Aires", en: "Buenos Aires", de: "Buenos Aires", zh: "布宜诺斯艾利斯", region: "americas" },
  { id: "bogota", tz: "America/Bogota", en: "Bogotá", de: "Bogotá", zh: "波哥大", region: "americas" },
  { id: "santiago", tz: "America/Santiago", en: "Santiago", de: "Santiago de Chile", zh: "圣地亚哥", region: "americas" },
  // Middle East & Africa
  { id: "dubai", tz: "Asia/Dubai", en: "Dubai", de: "Dubai", zh: "迪拜", region: "mea" },
  { id: "telaviv", tz: "Asia/Jerusalem", en: "Tel Aviv", de: "Tel Aviv", zh: "特拉维夫", region: "mea" },
  { id: "riyadh", tz: "Asia/Riyadh", en: "Riyadh", de: "Riad", zh: "利雅得", region: "mea" },
  { id: "istanbul", tz: "Europe/Istanbul", en: "Istanbul", de: "Istanbul", zh: "伊斯坦布尔", region: "mea" },
  { id: "cairo", tz: "Africa/Cairo", en: "Cairo", de: "Kairo", zh: "开罗", region: "mea" },
  { id: "johannesburg", tz: "Africa/Johannesburg", en: "Johannesburg", de: "Johannesburg", zh: "约翰内斯堡", region: "mea" },
  { id: "lagos", tz: "Africa/Lagos", en: "Lagos", de: "Lagos", zh: "拉各斯", region: "mea" },
];

const CITY_REGION_ORDER = ["apac", "europe", "americas", "mea"];

const STORAGE_KEY = "tzplanner_state_v1";
const DEFAULT_CITY_IDS = ["shanghai", "london", "zurich", "newyork"];

const state = {
  cityIds: [...DEFAULT_CITY_IDS],
  lang: "de",
  fraction: null, // 0..1 within the current UTC day; null = follow "now"
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const nav = (navigator.language || "en").toLowerCase();
      if (nav.indexOf("zh") === 0) state.lang = "zh";
      else if (nav.indexOf("de") === 0) state.lang = "de";
      return;
    }
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.cityIds) && saved.cityIds.length) {
      state.cityIds = saved.cityIds.filter((id) => CITY_DB.some((c) => c.id === id));
    }
    if (saved.lang === "en" || saved.lang === "de" || saved.lang === "zh") state.lang = saved.lang;
  } catch (e) {
    // ignore corrupt storage
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ cityIds: state.cityIds, lang: state.lang })
  );
}

function cityById(id) {
  return CITY_DB.find((c) => c.id === id);
}

function utcMidnightMs(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
}

function currentFraction() {
  if (state.fraction !== null) return state.fraction;
  const now = new Date();
  const midnight = utcMidnightMs(now);
  return (now.getTime() - midnight) / 86400000;
}

// Cache one Intl.DateTimeFormat per timezone/locale (construction is relatively expensive).
// Time and date are formatted separately: hour/minute are locale-independent numbers we
// render ourselves, while the date label is handed to Intl's own .format() so each locale's
// correct unit characters and word order (e.g. zh-CN "8月20日 周四" vs en-GB "Thu 20 Aug") are
// preserved instead of being reconstructed by hand in a fixed Western order.
const timeFmtCache = new Map();
function timeFormatterFor(tz) {
  if (!timeFmtCache.has(tz)) {
    timeFmtCache.set(
      tz,
      new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  }
  return timeFmtCache.get(tz);
}

const dateFmtCache = new Map();
function dateFormatterFor(tz, lang) {
  const key = tz + "|" + lang;
  if (!dateFmtCache.has(key)) {
    const locale = lang === "de" ? "de-DE" : lang === "zh" ? "zh-CN" : "en-GB";
    dateFmtCache.set(
      key,
      new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    );
  }
  return dateFmtCache.get(key);
}

function localPartsForCity(epochMs, tz) {
  const date = new Date(epochMs);
  const timeParts = timeFormatterFor(tz).formatToParts(date);
  const map = {};
  for (const p of timeParts) map[p.type] = p.value;
  return {
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    dateLabel: dateFormatterFor(tz, state.lang).format(date),
  };
}

function offsetLabelFor(epochMs, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = dtf.formatToParts(new Date(epochMs));
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  return tzPart ? tzPart.value.replace("GMT", "UTC") : "";
}

function dayPartClass(hour) {
  if (hour >= 9 && hour < 18) return "cell-work";
  if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 22)) return "cell-edge";
  return "cell-sleep";
}

// ---------- Rendering ----------

const boardLabels = document.getElementById("boardLabels");
const boardTracks = document.getElementById("boardTracks");
const cursorLine = document.getElementById("cursorLine");
const cursorReadout = document.getElementById("cursorReadout");
const citySelect = document.getElementById("citySelect");

function buildHourCells(tz, todayMidnight) {
  const frag = document.createDocumentFragment();
  for (let h = 0; h < 24; h++) {
    const epoch = todayMidnight + h * 3600000;
    const { hour } = localPartsForCity(epoch, tz);
    const cell = document.createElement("div");
    cell.className = "cell " + dayPartClass(hour);
    cell.textContent = String(hour).padStart(2, "0");
    frag.appendChild(cell);
  }
  return frag;
}

function render() {
  const t = I18N[state.lang];
  const now = new Date();
  const midnight = utcMidnightMs(now);

  boardLabels.innerHTML = "";
  boardTracks.innerHTML = "";

  // Reference UTC ruler
  const rulerLabel = document.createElement("div");
  rulerLabel.className = "label ruler-label";
  rulerLabel.textContent = t["ruler.label"];
  boardLabels.appendChild(rulerLabel);

  const rulerTrack = document.createElement("div");
  rulerTrack.className = "track ruler-track";
  for (let h = 0; h < 24; h++) {
    const cell = document.createElement("div");
    cell.className = "cell cell-ruler";
    cell.textContent = String(h).padStart(2, "0");
    rulerTrack.appendChild(cell);
  }
  boardTracks.appendChild(rulerTrack);

  // City rows
  for (const id of state.cityIds) {
    const city = cityById(id);
    if (!city) continue;

    const label = document.createElement("div");
    label.className = "label city-label";
    label.dataset.id = id;
    label.innerHTML = `
      <button class="remove-btn" aria-label="${t["remove.aria"]}" data-remove="${id}">×</button>
      <div class="city-name">${city[state.lang]}</div>
      <div class="city-time" data-time="${id}">--:--</div>
      <div class="city-meta">
        <span class="city-date" data-date="${id}"></span>
        <span class="city-offset" data-offset="${id}"></span>
      </div>
    `;
    boardLabels.appendChild(label);

    const track = document.createElement("div");
    track.className = "track city-track";
    track.dataset.id = id;
    track.appendChild(buildHourCells(city.tz, midnight));
    boardTracks.appendChild(track);
  }

  updateCursor(currentFraction());
  populateCitySelect();
}

function updateCursor(fraction) {
  fraction = Math.min(Math.max(fraction, 0), 0.999999);
  const now = new Date();
  const midnight = utcMidnightMs(now);
  const epoch = midnight + fraction * 86400000;

  cursorLine.style.left = fraction * 100 + "%";

  const utcParts = localPartsForCity(epoch, "UTC");
  cursorReadout.textContent = `UTC ${String(utcParts.hour).padStart(2, "0")}:${String(
    utcParts.minute
  ).padStart(2, "0")} · ${utcParts.dateLabel}`;

  for (const id of state.cityIds) {
    const city = cityById(id);
    if (!city) continue;
    const parts = localPartsForCity(epoch, city.tz);
    const timeEl = document.querySelector(`[data-time="${id}"]`);
    const dateEl = document.querySelector(`[data-date="${id}"]`);
    const offEl = document.querySelector(`[data-offset="${id}"]`);
    if (timeEl)
      timeEl.textContent = `${String(parts.hour).padStart(2, "0")}:${String(
        parts.minute
      ).padStart(2, "0")}`;
    if (dateEl) dateEl.textContent = parts.dateLabel;
    if (offEl) offEl.textContent = offsetLabelFor(epoch, city.tz);
  }
}

function populateCitySelect() {
  const t = I18N[state.lang];
  citySelect.innerHTML = `<option value="">${t["toolbar.addCityPlaceholder"]}</option>`;
  for (const region of CITY_REGION_ORDER) {
    const cities = CITY_DB.filter((c) => c.region === region && !state.cityIds.includes(c.id));
    if (!cities.length) continue;
    const group = document.createElement("optgroup");
    group.label = t["region." + region];
    for (const city of cities) {
      const opt = document.createElement("option");
      opt.value = city.id;
      opt.textContent = city[state.lang];
      group.appendChild(opt);
    }
    citySelect.appendChild(group);
  }
}

// ---------- i18n ----------

function applyI18n() {
  const t = I18N[state.lang];
  document.documentElement.lang = state.lang;
  document.title = t["meta.title"];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", t["meta.description"]);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (t[key] !== undefined) el.setAttribute("title", t[key]);
  });
  document.querySelectorAll(".lang-switch .lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  });
}

// ---------- Drag interaction ----------

let dragging = false;

function fractionFromClientX(clientX) {
  const rect = boardTracks.getBoundingClientRect();
  return (clientX - rect.left) / rect.width;
}

boardTracks.addEventListener("pointerdown", (e) => {
  dragging = true;
  boardTracks.setPointerCapture(e.pointerId);
  state.fraction = Math.min(Math.max(fractionFromClientX(e.clientX), 0), 0.999999);
  updateCursor(state.fraction);
});

boardTracks.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  state.fraction = Math.min(Math.max(fractionFromClientX(e.clientX), 0), 0.999999);
  updateCursor(state.fraction);
});

function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  try {
    boardTracks.releasePointerCapture(e.pointerId);
  } catch (err) {
    /* no-op */
  }
}
boardTracks.addEventListener("pointerup", endDrag);
boardTracks.addEventListener("pointercancel", endDrag);

// ---------- Controls ----------

document.getElementById("addCityBtn").addEventListener("click", () => {
  const id = citySelect.value;
  if (!id) return;
  state.cityIds.push(id);
  saveState();
  render();
});

boardLabels.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  const id = btn.getAttribute("data-remove");
  state.cityIds = state.cityIds.filter((c) => c !== id);
  saveState();
  render();
});

document.getElementById("nowBtn").addEventListener("click", () => {
  state.fraction = null;
  updateCursor(currentFraction());
});

document.querySelectorAll(".lang-switch .lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.lang = btn.dataset.lang;
    saveState();
    applyI18n();
    render();
  });
});

// ---------- Init ----------

loadState();
applyI18n();
render();

// Keep "now" mode ticking live if the user hasn't dragged yet.
setInterval(() => {
  if (state.fraction === null) updateCursor(currentFraction());
}, 30000);
