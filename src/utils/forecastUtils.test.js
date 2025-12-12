import assert from 'assert';
import { filterForecastByDate, summarizeForecastDay, getFishingOutlook } from './forecastUtils.js';
import { FORECAST_PRIORITY } from '../services/weatherAPI.js';

const sampleForecast = [
  { dt: new Date('2024-06-01T06:00:00Z').getTime() / 1000, temp: 70, wind_speed: 8, humidity: 60, pressure: 1015, clouds: 20, weather: [{ description: 'clear' }] },
  { dt: new Date('2024-06-01T18:00:00Z').getTime() / 1000, temp: 78, wind_speed: 10, humidity: 55, pressure: 1012, clouds: 40, weather: [{ description: 'partly cloudy' }] },
  { dt: new Date('2024-06-02T06:00:00Z').getTime() / 1000, temp: 73, wind_speed: 12, humidity: 65, pressure: 1009, clouds: 60, weather: [{ description: 'cloudy' }] }
];

// Check date filtering keeps only matching entries
const june1 = filterForecastByDate(sampleForecast, '2024-06-01');
assert.strictEqual(june1.length, 2, 'Should keep only entries for selected date');

// Check summarization returns averaged values
const summary = summarizeForecastDay(june1);
assert.ok(summary);
assert.strictEqual(Math.round(summary.avgTemp), 74, 'Average temp should be 74F');
assert.strictEqual(Math.round(summary.wind), 9, 'Average wind should be near 9 mph');

// Check outlook scoring returns label
const outlook = getFishingOutlook(summary);
assert.ok(outlook && outlook.label, 'Outlook should have a label');

// Ensure fallback priority order stays NOAA -> OWM -> Open-Meteo
assert.deepStrictEqual(FORECAST_PRIORITY.slice(0, 3), ['noaa-nws', 'openweathermap', 'open-meteo'], 'Forecast priority order changed unexpectedly');

console.log('forecastUtils checks passed');







