import axios from 'axios';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        address,
        key: API_KEY,
        region: 'in'
      }
    });

    if (response.data.results.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      placeId: result.place_id,
      types: result.types
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: API_KEY
      }
    });

    if (response.data.results.length === 0) {
      throw new Error('Location not found');
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      components: result.address_components
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
      params: {
        place_id: placeId,
        key: API_KEY,
        fields: 'name,formatted_address,geometry,photos,rating,reviews,types,website,phone_number,opening_hours,price_level'
      }
    });

    const result = response.data.result;
    return {
      name: result.name,
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      rating: result.rating,
      photos: result.photos?.map(p => ({
        reference: p.photo_reference,
        width: p.width,
        height: p.height
      })),
      types: result.types,
      website: result.website,
      phone: result.international_phone_number || result.formatted_phone_number,
      openingHours: result.opening_hours?.weekday_text,
      priceLevel: result.price_level
    };
  } catch (error) {
    console.error('Place details error:', error.message);
    return null;
  }
};

export const searchNearbyPlaces = async (lat, lng, radius = 5000, type = null) => {
  try {
    const params = {
      location: `${lat},${lng}`,
      radius,
      key: API_KEY
    };

    if (type) {
      params.type = type;
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json`, {
      params
    });

    return response.data.results.map(place => ({
      name: place.name,
      placeId: place.place_id,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating,
      types: place.types,
      vicinity: place.vicinity,
      photos: place.photos?.map(p => p.photo_reference)
    }));
  } catch (error) {
    console.error('Nearby search error:', error.message);
    return [];
  }
};

export const getDirections = async (origin, destination, waypoints = []) => {
  try {
    const params = {
      origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
      destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
      key: API_KEY,
      mode: 'driving'
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints.map(wp => 
        typeof wp === 'string' ? wp : `${wp.lat},${wp.lng}`
      ).join('|');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/directions/json`, {
      params
    });

    if (response.data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.text,
      distanceValue: leg.distance.value,
      duration: leg.duration.text,
      durationValue: leg.duration.value,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points,
      bounds: route.bounds
    };
  } catch (error) {
    console.error('Directions error:', error.message);
    return null;
  }
};

export const getDistanceMatrix = async (origins, destinations) => {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json`, {
      params: {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: API_KEY,
        mode: 'driving'
      }
    });

    return response.data.rows.map(row => 
      row.elements.map(element => ({
        distance: element.distance?.text,
        distanceValue: element.distance?.value,
        duration: element.duration?.text,
        durationValue: element.duration?.value,
        status: element.status
      }))
    );
  } catch (error) {
    console.error('Distance matrix error:', error.message);
    return null;
  }
};

export const autocompletePlaces = async (input, types = null) => {
  try {
    const params = {
      input,
      key: API_KEY,
      components: 'country:in'
    };

    if (types) {
      params.types = types;
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json`, {
      params
    });

    return response.data.predictions.map(prediction => ({
      description: prediction.description,
      placeId: prediction.place_id,
      types: prediction.types,
      structured: prediction.structured_formatting
    }));
  } catch (error) {
    console.error('Autocomplete error:', error.message);
    return [];
  }
};

export const getPhotoUrl = (photoReference, maxWidth = 400) => {
  return `${GOOGLE_MAPS_BASE_URL}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${API_KEY}`;
};

// Get emergency services near a location
export const getEmergencyServices = async (lat, lng) => {
  const services = [];

  try {
    // Hospitals
    const hospitals = await searchNearbyPlaces(lat, lng, 10000, 'hospital');
    services.push(...hospitals.slice(0, 3).map(h => ({
      ...h,
      type: 'hospital'
    })));

    // Police stations
    const police = await searchNearbyPlaces(lat, lng, 10000, 'police');
    services.push(...police.slice(0, 2).map(p => ({
      ...p,
      type: 'police'
    })));

    // Pharmacies
    const pharmacies = await searchNearbyPlaces(lat, lng, 5000, 'pharmacy');
    services.push(...pharmacies.slice(0, 2).map(p => ({
      ...p,
      type: 'pharmacy'
    })));

    return services;
  } catch (error) {
    console.error('Emergency services error:', error.message);
    return [];
  }
};

export default {
  geocodeAddress,
  reverseGeocode,
  getPlaceDetails,
  searchNearbyPlaces,
  getDirections,
  getDistanceMatrix,
  autocompletePlaces,
  getPhotoUrl,
  getEmergencyServices
};
