# API Change: OpenWeather Integration

## ✅ What Changed

WeatherWise now uses the **OpenWeather API** for current weather data instead of Open-Meteo.

### Why the change?
- ✅ **Richer metadata** (native icons, descriptions, humidity, wind, etc.)
- ✅ **Stable SLA** and predictable rate limits
- ✅ **Direct city lookup** without manual geocoding

## Requirements

- Sign up for a free account at [openweathermap.org/api](https://openweathermap.org/api)
- Create an API key and set it in `backend/.env`:

```env
OPENWEATHER_API_KEY=your-openweather-api-key
```

## Technical Details

1. The backend now calls `https://api.openweathermap.org/data/2.5/weather`.
2. Responses are mapped straight into `WeatherResponse`, using OpenWeather's icon codes.
3. Missing API keys raise a `WeatherClientError`.

## Updated Files

- `backend/app/services/weather_client.py` – OpenWeather client implementation
- `backend/app/core/config.py` – added `openweather_api_key` setting
- Documentation (`README.md`, `QUICKSTART.md`, `RUN_INSTRUCTIONS.md`) updated with the new requirement

## Migration Notes

- Add `OPENWEATHER_API_KEY` to your `.env`.
- Restart the backend so it can pick up the new environment variable.

## Rate Limits

The free OpenWeather tier allows 1,000 calls/day and 60 calls/min. Consider caching in production to stay comfortably within limits.
- Don't make excessive requests
- Cache results when possible
- For production, consider implementing request throttling

## Support

If you encounter any issues:
1. Check your internet connection
2. Verify city names are spelled correctly
3. Review your OpenWeather account limits/status: https://home.openweathermap.org/api_keys

---

**Note:** The frontend continues to work exactly the same - no changes needed there!

