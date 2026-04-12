import axios from 'axios';

const OPENMETEO_BASE_URL = process.env.OPENMETEO_API_URL || 'https://api.open-meteo.com/v1/forecast';
const OPENMETEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const API_KEY = process.env.OPENWEATHER_API_KEY;

const hasOpenWeatherKey = () => Boolean(API_KEY && API_KEY !== 'your-openweather-api-key');

const hasOpenMeteoConfig = () => Boolean(OPENMETEO_BASE_URL);

const geocodeCity = async (city, country = 'IN') => {
  const response = await axios.get(OPENMETEO_GEOCODING_URL, {
    params: {
      name: city,
      count: 1,
      language: 'en',
      format: 'json',
      country,
    },
  });

  const result = response.data?.results?.[0];
  if (!result) {
    throw new Error(`Unable to geocode city: ${city}`);
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    countryCode: result.country_code,
  };
};

const mapOpenMeteoCurrent = (data, fallbackLocation) => ({
  location: fallbackLocation,
  current: {
    temp: Math.round(data.current?.temperature_2m ?? 25),
    feelsLike: Math.round(data.current?.apparent_temperature ?? data.current?.temperature_2m ?? 25),
    humidity: Math.round(data.current?.relative_humidity_2m ?? 65),
    windSpeed: Math.round(data.current?.wind_speed_10m ?? 8),
    condition: getOpenMeteoConditionLabel(data.current?.weather_code),
    description: getOpenMeteoConditionLabel(data.current?.weather_code).toLowerCase(),
    icon: getOpenMeteoIcon(data.current?.weather_code),
    pressure: Math.round(data.current?.surface_pressure ?? 1013),
    visibility: 10000,
  },
  coordinates: {
    lat: data.latitude,
    lng: data.longitude,
  },
});

const mapOpenMeteoForecast = (data, days) => {
  const times = data.daily?.time || [];
  const highs = data.daily?.temperature_2m_max || [];
  const lows = data.daily?.temperature_2m_min || [];
  const codes = data.daily?.weather_code || [];

  return times.slice(0, days).map((date, index) => ({
    date: new Date(date),
    high: Math.round(highs[index] ?? 25),
    low: Math.round(lows[index] ?? 18),
    condition: getOpenMeteoConditionLabel(codes[index]),
    icon: getOpenMeteoIcon(codes[index]),
  }));
};

const getOpenMeteoConditionLabel = (code) => {
  const weatherCode = Number(code);

  if ([0].includes(weatherCode)) return 'Sunny';
  if ([1, 2].includes(weatherCode)) return 'Partly Cloudy';
  if ([3].includes(weatherCode)) return 'Cloudy';
  if ([45, 48].includes(weatherCode)) return 'Fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return 'Rainy';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'Snow';
  if ([95, 96, 99].includes(weatherCode)) return 'Thunderstorm';

  return 'Clear';
};

const getOpenMeteoIcon = (code) => {
  const weatherCode = Number(code);

  if ([0].includes(weatherCode)) return '01d';
  if ([1, 2].includes(weatherCode)) return '02d';
  if ([3, 45, 48].includes(weatherCode)) return '03d';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '10d';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '13d';
  if ([95, 96, 99].includes(weatherCode)) return '11d';

  return '01d';
};

export const getCurrentWeather = async (city, country = 'IN') => {
  try {
    if (hasOpenMeteoConfig()) {
      const location = await geocodeCity(city, country);
      const response = await axios.get(OPENMETEO_BASE_URL, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
          timezone: 'auto',
        },
      });

      return mapOpenMeteoCurrent({ ...response.data, latitude: location.latitude, longitude: location.longitude }, location.name || city);
    }

    if (!hasOpenWeatherKey()) {
      console.warn('No weather API key/config found; returning fallback weather data for', city);
      return getFallbackWeather(city);
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: `${city},${country}`,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    return {
      location: data.name,
      current: {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        visibility: data.visibility
      },
      coordinates: {
        lat: data.coord.lat,
        lng: data.coord.lon
      }
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return getFallbackWeather(city);
  }
};

export const getWeatherForecast = async (city, days = 5, country = 'IN') => {
  try {
    if (hasOpenMeteoConfig()) {
      const location = await geocodeCity(city, country);
      const response = await axios.get(OPENMETEO_BASE_URL, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          daily: 'temperature_2m_max,temperature_2m_min,weather_code',
          forecast_days: Math.max(days, 1),
          timezone: 'auto',
        },
      });

      return mapOpenMeteoForecast(response.data, days);
    }

    if (!hasOpenWeatherKey()) {
      console.warn('No weather API key/config found; returning fallback forecast for', city);
      return getFallbackForecast(city, days);
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: `${city},${country}`,
        appid: API_KEY,
        units: 'metric'
      }
    });

    // Group by day and get daily forecast
    const dailyData = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          conditions: [],
          icons: []
        };
      }
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].conditions.push(item.weather[0].main);
      dailyData[date].icons.push(item.weather[0].icon);
    });

    const forecast = Object.entries(dailyData)
      .slice(0, days)
      .map(([date, data]) => {
        const high = Math.max(...data.temps);
        const low = Math.min(...data.temps);
        const mostCommonCondition = data.conditions.sort((a, b) =>
          data.conditions.filter(v => v === a).length - data.conditions.filter(v => v === b).length
        ).pop();
        const mostCommonIcon = data.icons.sort((a, b) =>
          data.icons.filter(v => v === a).length - data.icons.filter(v => v === b).length
        ).pop();

        return {
          date: new Date(date),
          high: Math.round(high),
          low: Math.round(low),
          condition: mostCommonCondition,
          icon: mostCommonIcon
        };
      });

    return forecast;
  } catch (error) {
    console.error('Forecast API error:', error.message);
    return getFallbackForecast(city, days);
  }
};

export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    if (hasOpenMeteoConfig()) {
      const response = await axios.get(OPENMETEO_BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
          timezone: 'auto',
        },
      });

      return mapOpenMeteoCurrent(response.data, 'Unknown Location');
    }

    if (!hasOpenWeatherKey()) {
      console.warn('No weather API key/config found; returning fallback weather data for coordinates');
      return getFallbackWeather('Unknown Location');
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    return {
      location: data.name,
      current: {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      }
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return getFallbackWeather('Unknown Location');
  }
};

// Fallback weather data for Indian cities
const getFallbackWeather = (city) => {
  const fallbackData = {
    'Delhi': { temp: 28, condition: 'Haze', icon: '50d' },
    'Mumbai': { temp: 30, condition: 'Clouds', icon: '03d' },
    'Bangalore': { temp: 24, condition: 'Clouds', icon: '04d' },
    'Pune': { temp: 26, condition: 'Clear', icon: '01d' },
    'Chennai': { temp: 32, condition: 'Clear', icon: '01d' },
    'Kolkata': { temp: 31, condition: 'Haze', icon: '50d' },
    'Hyderabad': { temp: 29, condition: 'Clouds', icon: '03d' },
    'Jaipur': { temp: 33, condition: 'Clear', icon: '01d' },
    'Goa': { temp: 29, condition: 'Clear', icon: '01d' },
    'Manali': { temp: 15, condition: 'Clouds', icon: '04d' },
    'Shimla': { temp: 12, condition: 'Clouds', icon: '04d' },
    'Srinagar': { temp: 10, condition: 'Snow', icon: '13d' },
    'Kochi': { temp: 28, condition: 'Rain', icon: '10d' },
    'Shillong': { temp: 18, condition: 'Clouds', icon: '04d' }
  };

  const data = fallbackData[city] || { temp: 25, condition: 'Clear', icon: '01d' };

  return {
    location: city,
    current: {
      temp: data.temp,
      feelsLike: data.temp - 2,
      humidity: 65,
      windSpeed: 8,
      condition: data.condition,
      description: data.condition.toLowerCase(),
      icon: data.icon,
      pressure: 1013,
      visibility: 10000
    }
  };
};

const getFallbackForecast = (city, days) => {
  const baseTemp = getFallbackWeather(city).current.temp;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const variation = Math.floor(Math.random() * 6) - 3;
    
    return {
      date,
      high: baseTemp + variation + 3,
      low: baseTemp + variation - 3,
      condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
      icon: ['01d', '03d', '10d'][Math.floor(Math.random() * 3)]
    };
  });
};

export default {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherByCoordinates
};
