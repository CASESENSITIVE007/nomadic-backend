import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherByCoordinates
} from '../services/weather.service.js';

// @desc    Get current weather for a city
// @route   GET /api/weather/current
// @access  Public
export const getCurrent = asyncHandler(async (req, res) => {
  const { city, lat, lng } = req.query;

  let weather;
  if (lat && lng) {
    weather = await getWeatherByCoordinates(parseFloat(lat), parseFloat(lng));
  } else if (city) {
    weather = await getCurrentWeather(city);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide either city name or coordinates (lat, lng)'
    });
  }

  res.json({
    success: true,
    data: weather
  });
});

// @desc    Get weather forecast for a city
// @route   GET /api/weather/forecast
// @access  Public
export const getForecast = asyncHandler(async (req, res) => {
  const { city, days } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a city name'
    });
  }

  const forecast = await getWeatherForecast(city, parseInt(days) || 5);

  res.json({
    success: true,
    data: {
      city,
      forecast
    }
  });
});

// @desc    Get weather for multiple cities (batch)
// @route   POST /api/weather/batch
// @access  Public
export const getBatchWeather = asyncHandler(async (req, res) => {
  const { cities } = req.body;

  if (!cities || !Array.isArray(cities) || cities.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of cities'
    });
  }

  const weatherData = await Promise.all(
    cities.map(async (city) => {
      const weather = await getCurrentWeather(city);
      return { city, ...weather };
    })
  );

  res.json({
    success: true,
    data: weatherData
  });
});

// @desc    Get weather for trip destinations
// @route   POST /api/weather/trip-weather
// @access  Private
export const getTripWeather = asyncHandler(async (req, res) => {
  const { destinations } = req.body;

  if (!destinations || !Array.isArray(destinations)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide destinations array'
    });
  }

  const weatherData = await Promise.all(
    destinations.map(async (dest) => {
      const current = await getCurrentWeather(dest.city || dest);
      const forecast = await getWeatherForecast(dest.city || dest, 3);
      return {
        destination: dest.city || dest,
        coordinates: dest.coordinates || current.coordinates,
        current: current.current,
        forecast
      };
    })
  );

  res.json({
    success: true,
    data: weatherData
  });
});

export default {
  getCurrent,
  getForecast,
  getBatchWeather,
  getTripWeather
};
