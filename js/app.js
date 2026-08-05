// World Meeting Time Planner — timeline drag logic + i18n + persistence.
// No external libraries: relies on Intl.DateTimeFormat for correct, DST-aware
// per-city local time conversion.

const CITY_DB = [
  { id: "shanghai", tz: "Asia/Shanghai", en: "Beijing", de: "Peking", zh: "北京" },
  { id: "london", tz: "Europe/London", en: "London", de: "London", zh: "伦敦" },
  { id: "zurich", tz: "Europe/Zurich", en: "Zurich", de: "Zürich", zh: "苏黎世" },
  { id: "newyork", tz: "America/New_York", en: "New York", de: "New York", zh: "纽约" },
  { id: "tokyo", tz: "Asia/Tokyo", en: "Tokyo", de: "Tokio", zh: "东京" },
  { id: "singapore", tz: "Asia/Singapore", en: "Singapore", de: "Singapur", zh: "新加坡" },
  { id: "dubai", tz: "Asia/Dubai", en: "Dubai", de: "Dubai", zh: "迪拜" },
  { id: "sydney", tz: "Australia/Sydney", en: "Sydney", de: "Sydney", zh: "悉尼" },
  { id: "losangeles", tz: "America/Los_Angeles", en: "Los Angeles", de: "Los Angeles", zh: "洛杉矶" },
  { id: "saopaulo", tz: "America/Sao_Paulo", en: "São Paulo", de: "São Paulo", zh: "圣保罗" },
  { id: "paris", tz: "Europe/Paris", en: "Paris", de: "Paris", zh: "巴黎" },
  { id: "berlin", tz: "Europe/Berlin", en: "Berlin", de: "Berlin", zh: "柏林" },
  { id: "moscow", tz: "Europe/Moscow", en: "Moscow", de: "Moskau", zh: "莫斯科" },
  { id: "mumbai", tz: "Asia/Kolkata", en: "Mumbai", de: "Mumbai", zh: "孟买" },
  { id: "toronto", tz: "America/Toronto", en: "Toronto", de: "Toronto", zh: "多伦多" },
];

const STORAGE_KEY = "tzplanner_state_v1";
const DEFAULT_CITY_IDS = ["shanghai", "london", "zurich", "newyork"];

const state = {
  cityIds: [...DEFAULT_CITY_IDS],
  lang: "en",
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

// Cache one Intl.DateTimeFormat per timezone (construction is relatively expensive).
const dtfCache = new Map();
function formatterFor(tz, lang) {
  const key = tz + "|" + lang;
  if (!dtfCache.has(key)) {
    const locale = lang === "de" ? "de-DE" : lang === "zh" ? "zh-CN" : "en-GB";
    dtfCache.set(
      key,
      new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    );
  }
  return dtfCache.get(key);
}

function localPartsForCity(epochMs, tz) {
  const parts = formatterFor(tz, state.lang).formatToParts(new Date(epochMs));
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    weekday: map.weekday,
    day: map.day,
    month: map.month,
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
  ).padStart(2, "0")} · ${utcParts.weekday} ${utcParts.day} ${utcParts.month}`;

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
    if (dateEl) dateEl.textContent = `${parts.weekday} ${parts.day} ${parts.month}`;
    if (offEl) offEl.textContent = offsetLabelFor(epoch, city.tz);
  }
}

function populateCitySelect() {
  const t = I18N[state.lang];
  citySelect.innerHTML = `<option value="">${t["toolbar.addCityPlaceholder"]}</option>`;
  for (const city of CITY_DB) {
    if (state.cityIds.includes(city.id)) continue;
    const opt = document.createElement("option");
    opt.value = city.id;
    opt.textContent = city[state.lang];
    citySelect.appendChild(opt);
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
