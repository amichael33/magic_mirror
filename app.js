const cfg = window.MIRROR_CONFIG ?? {};

const $ = (id) => document.getElementById(id);

const WMO_ICONS = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

const WMO_LABELS = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Showers",
  95: "Thunderstorm",
};

const DEFAULT_FISH = window.FISH_DATABASE ?? [];

function hideRegion(el, hidden) {
  if (!el) return;
  el.closest(".region")?.setAttribute("data-hidden", hidden ? "true" : "false");
}

function formatTemp(value, units) {
  const n = Math.round(value);
  return units === "metric" ? `${n}°C` : `${n}°F`;
}

function applyOrientation() {
  const mode = cfg.orientation === "landscape" ? "landscape" : "portrait";
  document.documentElement.dataset.orientation = mode;
  $("mirror").classList.toggle("mirror--portrait", mode === "portrait");
  $("mirror").classList.toggle("mirror--landscape", mode === "landscape");
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86_400_000);
}

function updateClock() {
  const tz = cfg.timezone || undefined;
  const now = new Date();

  $("time").textContent = now.toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  $("date").textContent = now.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function updateGreeting() {
  const g = cfg.greeting;
  const el = $("greeting");
  if (!g?.enabled) {
    hideRegion(el, true);
    return;
  }
  hideRegion(el, false);

  const hour = Number(
    new Date().toLocaleString("en-US", {
      timeZone: cfg.timezone,
      hour: "numeric",
      hour12: false,
    })
  );

  const name = g.name ? `, ${g.name}` : "";
  let text = `Hello${name}`;
  if (hour >= g.nightHour || hour < g.morningHour) text = `Good night${name}`;
  else if (hour < g.eveningHour) text = `Good morning${name}`;
  else text = `Good afternoon${name}`;

  el.textContent = text;
}

async function resolveCoords() {
  const w = cfg.weather;
  if (w.latitude != null && w.longitude != null) {
    return { lat: w.latitude, lon: w.longitude };
  }
  const q = [w.city, w.country].filter(Boolean).join(", ");
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const place = data.results?.[0];
  if (!place) throw new Error(`Location not found: ${q}`);
  return { lat: place.latitude, lon: place.longitude };
}

async function updateWeather() {
  const w = cfg.weather;
  const root = $("weather");
  if (!w?.enabled) {
    hideRegion(root, true);
    return;
  }
  hideRegion(root, false);
  root.classList.add("weather--loading");

  const cityLabel = w.locationLabel ?? "Houston, TX";

  try {
    const { lat, lon } = await resolveCoords();
    const tempUnit = w.units === "metric" ? "celsius" : "fahrenheit";
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code` +
      `&temperature_unit=${tempUnit}&timezone=${encodeURIComponent(cfg.timezone || "auto")}`;

    const res = await fetch(url);
    const data = await res.json();
    const cur = data.current;
    const code = cur.weather_code ?? 0;
    const condition = WMO_LABELS[code] ?? "Current conditions";

    $("weather-icon").textContent = WMO_ICONS[code] ?? "🌡️";
    $("weather-temp").textContent = formatTemp(cur.temperature_2m, w.units);
    $("weather-desc").textContent = `${condition} · ${cityLabel}`;
    $("weather-feels").textContent =
      cur.apparent_temperature != null
        ? `Feels like ${formatTemp(cur.apparent_temperature, w.units)}`
        : "";
    root.classList.remove("weather--loading", "weather--error");
  } catch (err) {
    console.error(err);
    root.classList.add("weather--error");
    root.classList.remove("weather--loading");
    $("weather-temp").textContent = "--°";
    $("weather-desc").textContent = `Weather · ${cityLabel}`;
    $("weather-feels").textContent = "";
  }
}

function updateCredit() {
  const c = cfg.credit;
  const el = $("credit");
  if (!c?.enabled || !c.text) {
    hideRegion(el, true);
    return;
  }
  hideRegion(el, false);
  el.textContent = c.text;
}

function updateFishOfTheDay() {
  const f = cfg.fishOfTheDay;
  const root = $("fish");
  if (!f?.enabled) {
    hideRegion(root, true);
    return;
  }
  hideRegion(root, false);

  const list = f.fish?.length ? f.fish : DEFAULT_FISH;
  if (!list.length) {
    $("fish-name").textContent = "No fish loaded";
    $("fish-fact").textContent = "Check fish-data.js";
    return;
  }
  const pick = list[dayOfYear() % list.length];

  $("fish-name").textContent = pick.name;
  $("fish-fact").textContent = pick.fact ?? "";
}

function minutes(m) {
  return m * 60 * 1000;
}

function start() {
  applyOrientation();
  updateClock();
  updateGreeting();
  updateCredit();
  updateFishOfTheDay();
  updateWeather();

  setInterval(updateClock, 1000);
  setInterval(updateGreeting, 60_000);
  setInterval(updateFishOfTheDay, minutes(60));

  const weatherMins = cfg.weatherRefreshMinutes ?? 15;
  if (cfg.weather?.enabled) {
    setInterval(updateWeather, minutes(weatherMins));
  }
}

start();
