import { asyncHandler } from '../middleware/errorHandler.js';
import {
  geocodeAddress,
  reverseGeocode,
  getPlaceDetails,
  searchNearbyPlaces,
  getDirections,
  getDistanceMatrix,
  autocompletePlaces,
  getPhotoUrl,
  getEmergencyServices
} from '../services/maps.service.js';

// @desc    Geocode an address
// @route   GET /api/maps/geocode
// @access  Public
export const geocode = asyncHandler(async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an address'
    });
  }

  const result = await geocodeAddress(address);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

// @desc    Reverse geocode coordinates
// @route   GET /api/maps/reverse-geocode
// @access  Public
export const reverseGeocodeLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Please provide latitude and longitude'
    });
  }

  const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get place details
// @route   GET /api/maps/place/:placeId
// @access  Public
export const placeDetails = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  const result = await getPlaceDetails(placeId);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

// @desc    Search nearby places
// @route   GET /api/maps/nearby
// @access  Public
export const nearbyPlaces = asyncHandler(async (req, res) => {
  const { lat, lng, radius, type } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Please provide latitude and longitude'
    });
  }

  const places = await searchNearbyPlaces(
    parseFloat(lat),
    parseFloat(lng),
    parseInt(radius) || 5000,
    type || null
  );

  res.json({
    success: true,
    data: places
  });
});

// @desc    Get directions
// @route   GET /api/maps/directions
// @access  Public
export const getRoute = asyncHandler(async (req, res) => {
  const { origin, destination, waypoints } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      message: 'Please provide origin and destination'
    });
  }

  const parsedWaypoints = waypoints ? waypoints.split('|') : [];
  const result = await getDirections(origin, destination, parsedWaypoints);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get distance matrix
// @route   POST /api/maps/distance-matrix
// @access  Public
export const distanceMatrix = asyncHandler(async (req, res) => {
  const { origins, destinations } = req.body;

  if (!origins || !destinations || !Array.isArray(origins) || !Array.isArray(destinations)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide origins and destinations arrays'
    });
  }

  const result = await getDistanceMatrix(origins, destinations);

  res.json({
    success: true,
    data: result
  });
});

// @desc    Autocomplete places
// @route   GET /api/maps/autocomplete
// @access  Public
export const autocomplete = asyncHandler(async (req, res) => {
  const { input, types } = req.query;

  if (!input) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an input'
    });
  }

  const results = await autocompletePlaces(input, types || null);

  res.json({
    success: true,
    data: results
  });
});

// @desc    Get place photo URL
// @route   GET /api/maps/photo
// @access  Public
export const getPhoto = asyncHandler(async (req, res) => {
  const { reference, maxWidth } = req.query;

  if (!reference) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a photo reference'
    });
  }

  const url = getPhotoUrl(reference, parseInt(maxWidth) || 400);

  res.json({
    success: true,
    data: { url }
  });
});

// @desc    Get emergency services near location
// @route   GET /api/maps/emergency-services
// @access  Public
export const emergencyServices = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Please provide latitude and longitude'
    });
  }

  const services = await getEmergencyServices(parseFloat(lat), parseFloat(lng));

  res.json({
    success: true,
    data: services
  });
});

// @desc    Get trip route with multiple stops
// @route   POST /api/maps/trip-route
// @access  Private
export const getTripRoute = asyncHandler(async (req, res) => {
  const { origin, destination, stops } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      message: 'Please provide origin and destination'
    });
  }

  const waypoints = stops?.map(stop => ({
    lat: stop.lat,
    lng: stop.lng,
    name: stop.name
  })) || [];

  const result = await getDirections(origin, destination, waypoints);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...result,
      stops: waypoints
    }
  });
});

export default {
  geocode,
  reverseGeocodeLocation,
  placeDetails,
  nearbyPlaces,
  getRoute,
  distanceMatrix,
  autocomplete,
  getPhoto,
  emergencyServices,
  getTripRoute
};
