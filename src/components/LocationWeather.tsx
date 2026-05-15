import React, { useState, useEffect } from 'react';
import { MapPin, Sun, Cloud, CloudRain, Loader2 } from 'lucide-react';

const LOCATION_WEATHER_CACHE_TTL_MS = 30_000;

type LocationWeatherSnapshot = {
  location: string;
  weather: { temp: string; condition: string };
  at: number;
};

let locationWeatherCache: LocationWeatherSnapshot | null = null;
let pendingLocationWeatherPromise: Promise<LocationWeatherSnapshot> | null = null;

export default function LocationWeather() {
  const [location, setLocation] = useState('定位中...');
  const [weather, setWeather] = useState({ temp: '--', condition: 'sunny' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocationAndWeather = async (lat: number, lon: number): Promise<LocationWeatherSnapshot> => {
      try {
        // 1. Fetch Location Name (Reverse Geocoding via BigDataCloud free API)
        let city = '未知位置';
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            city = geoData.city || geoData.locality || geoData.principalSubdivision || '未知位置';
          }
        } catch (e) {
          console.warn("Reverse geocoding failed, using default location name", e);
        }
        
        // 2. Fetch Weather (via Open-Meteo free API)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        const temp = Math.round(weatherData.current_weather.temperature).toString();
        const code = weatherData.current_weather.weathercode;
        
        // WMO Weather interpretation codes
        let condition = 'sunny';
        if (code >= 1 && code <= 3) condition = 'cloudy';
        if (code >= 51) condition = 'rainy';

        const snapshot: LocationWeatherSnapshot = {
          location: city,
          weather: { temp, condition },
          at: Date.now(),
        };
        locationWeatherCache = snapshot;
        return snapshot;
      } catch (error) {
        console.error("Failed to fetch location/weather", error);
        return {
          location: '定位失败',
          weather: { temp: '--', condition: 'sunny' },
          at: Date.now(),
        };
      }
    };

    const applySnapshot = (snapshot: LocationWeatherSnapshot) => {
      if (!isMounted) return;
      setLocation(snapshot.location);
      setWeather(snapshot.weather);
      setIsLoading(false);
    };

    const load = async () => {
      const now = Date.now();
      if (locationWeatherCache && now - locationWeatherCache.at < LOCATION_WEATHER_CACHE_TTL_MS) {
        applySnapshot(locationWeatherCache);
        return;
      }
      if (pendingLocationWeatherPromise) {
        const snapshot = await pendingLocationWeatherPromise;
        applySnapshot(snapshot);
        return;
      }

      if ('geolocation' in navigator) {
        pendingLocationWeatherPromise = new Promise<LocationWeatherSnapshot>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              void fetchLocationAndWeather(position.coords.latitude, position.coords.longitude)
                .then(resolve)
                .finally(() => {
                  pendingLocationWeatherPromise = null;
                });
            },
            (error) => {
              console.error("Geolocation error:", error);
              const fallback: LocationWeatherSnapshot = {
                location: '未授权定位',
                weather: { temp: '--', condition: 'sunny' },
                at: Date.now(),
              };
              resolve(fallback);
              pendingLocationWeatherPromise = null;
            },
            { timeout: 10000 }
          );
        });
        const snapshot = await pendingLocationWeatherPromise;
        locationWeatherCache = snapshot;
        applySnapshot(snapshot);
      } else {
        applySnapshot({
          location: '不支持定位',
          weather: { temp: '--', condition: 'sunny' },
          at: Date.now(),
        });
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const WeatherIcon = weather.condition === 'sunny' ? Sun : weather.condition === 'cloudy' ? Cloud : CloudRain;

  return (
    <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors">
      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-200">
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
        )}
        <span className="text-xs font-bold max-w-[80px] truncate">{location}</span>
      </div>
      <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-200">
        <WeatherIcon className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-bold">{weather.temp}°C</span>
      </div>
    </div>
  );
}
