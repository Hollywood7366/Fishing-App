// Utilities for selecting and summarizing forecast data for a given day

const toDateString = (date) => new Date(date).toDateString();

export const filterForecastByDate = (list = [], targetDate) => {
  if (!targetDate) return [];
  const target = toDateString(targetDate);
  return list.filter((entry) => toDateString(entry.dt * 1000) === target);
};

export const summarizeForecastDay = (entries = []) => {
  if (!entries.length) return null;

  const temps = entries.map((e) => e.temp ?? e.main?.temp).filter((v) => typeof v === 'number');
  const winds = entries.map((e) => e.wind_speed ?? e.wind?.speed).filter((v) => typeof v === 'number');
  const humidities = entries.map((e) => e.humidity ?? e.main?.humidity).filter((v) => typeof v === 'number');
  const pressures = entries.map((e) => e.pressure ?? e.main?.pressure).filter((v) => typeof v === 'number');
  const clouds = entries.map((e) => (typeof e.clouds === 'number' ? e.clouds : e.clouds?.all)).filter((v) => typeof v === 'number');

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const midEntry = entries[Math.min(entries.length - 1, Math.floor(entries.length / 2))];
  const primaryWeather = midEntry?.weather?.[0];

  return {
    avgTemp: avg(temps),
    maxTemp: temps.length ? Math.max(...temps) : null,
    minTemp: temps.length ? Math.min(...temps) : null,
    wind: avg(winds),
    humidity: avg(humidities),
    pressure: avg(pressures),
    clouds: avg(clouds),
    icon: primaryWeather?.icon,
    description: primaryWeather?.description || primaryWeather?.main,
    source: entries[0]?._source
  };
};

export const getFishingOutlook = (summary) => {
  if (!summary) return null;

  let score = 70;
  if (summary.wind) {
    if (summary.wind > 18) score -= 15;
    else if (summary.wind > 12) score -= 8;
    else if (summary.wind < 6) score += 5;
  }

  if (summary.clouds !== null && summary.clouds !== undefined) {
    if (summary.clouds > 75) score -= 5;
    else if (summary.clouds > 40) score += 2;
    else score += 4;
  }

  if (summary.humidity && summary.humidity > 85) score -= 5;
  if (summary.pressure && summary.pressure >= 1010 && summary.pressure <= 1022) score += 5;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let label = 'fair';
  if (clamped >= 85) label = 'excellent';
  else if (clamped >= 70) label = 'good';
  else if (clamped >= 55) label = 'fair';
  else label = 'tough';

  return { score: clamped, label };
};

export default {
  filterForecastByDate,
  summarizeForecastDay,
  getFishingOutlook
};







