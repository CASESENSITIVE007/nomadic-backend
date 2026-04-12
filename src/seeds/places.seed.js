import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';

dotenv.config();

const places = [
  // Metro Cities
  {
    name: 'New Delhi',
    location: {
      address: 'New Delhi, Delhi, India',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    description: 'The capital city of India, blending ancient history with modern culture. Home to iconic monuments, bustling markets, and diverse cuisine.',
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
    ],
    type: ['city', 'cultural', 'historical'],
    state: 'Delhi',
    rating: 4.5,
    thingsToDo: [
      { name: 'Visit India Gate', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Explore Red Fort', category: 'historical', estimatedCost: 35 },
      { name: 'Walk through Chandni Chowk', category: 'shopping', estimatedCost: 500 },
      { name: 'Visit Qutub Minar', category: 'historical', estimatedCost: 35 },
      { name: 'Explore Humayun\'s Tomb', category: 'historical', estimatedCost: 35 },
      { name: 'Lotus Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Akshardham Temple', category: 'religious', estimatedCost: 0 },
      { name: 'National Museum', category: 'museum', estimatedCost: 20 }
    ],
    bestTimeToVisit: 'October to March',
    idealDuration: '3-4 days',
    budgetRange: { min: 2000, max: 15000 },
    attractions: [
      { name: 'India Gate', type: 'monument', entryFee: 0 },
      { name: 'Red Fort', type: 'monument', entryFee: 35 },
      { name: 'Qutub Minar', type: 'monument', entryFee: 35 },
      { name: 'Humayun\'s Tomb', type: 'monument', entryFee: 35 },
      { name: 'Jama Masjid', type: 'religious', entryFee: 0 },
      { name: 'Raj Ghat', type: 'memorial', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Karim\'s', cuisine: 'Mughlai', priceRange: 'medium' },
      { name: 'Paranthe Wali Gali', cuisine: 'Street Food', priceRange: 'low' },
      { name: 'Indian Accent', cuisine: 'Fine Dining', priceRange: 'high' },
      { name: 'Bukhara', cuisine: 'North Indian', priceRange: 'high' }
    ],
    weather: {
      summer: '25°C - 45°C',
      winter: '5°C - 25°C',
      monsoon: '25°C - 35°C'
    },
    howToReach: {
      byAir: 'Indira Gandhi International Airport (DEL)',
      byTrain: 'New Delhi Railway Station, Old Delhi Railway Station',
      byRoad: 'Well connected by NH1, NH2, NH8, NH10'
    }
  },
  {
    name: 'Mumbai',
    location: {
      address: 'Mumbai, Maharashtra, India',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    description: 'The City of Dreams, India\'s financial capital with iconic landmarks, Bollywood glamour, and vibrant street life.',
    images: [
      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'
    ],
    type: ['city', 'beach', 'cultural'],
    state: 'Maharashtra',
    rating: 4.6,
    thingsToDo: [
      { name: 'Gateway of India', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Marine Drive', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Elephanta Caves', category: 'historical', estimatedCost: 600 },
      { name: 'Juhu Beach', category: 'beach', estimatedCost: 0 },
      { name: 'Bollywood Studio Tour', category: 'entertainment', estimatedCost: 1500 },
      { name: 'Siddhivinayak Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Chhatrapati Shivaji Terminus', category: 'historical', estimatedCost: 0 },
      { name: 'Colaba Causeway Shopping', category: 'shopping', estimatedCost: 1000 }
    ],
    bestTimeToVisit: 'November to February',
    idealDuration: '3-5 days',
    budgetRange: { min: 3000, max: 20000 },
    attractions: [
      { name: 'Gateway of India', type: 'monument', entryFee: 0 },
      { name: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', type: 'museum', entryFee: 70 },
      { name: 'Haji Ali Dargah', type: 'religious', entryFee: 0 },
      { name: 'Siddhivinayak Temple', type: 'religious', entryFee: 0 },
      { name: 'Elephanta Caves', type: 'historical', entryFee: 40 }
    ],
    restaurants: [
      { name: 'Leopold Cafe', cuisine: 'Multi-cuisine', priceRange: 'medium' },
      { name: 'Bademiya', cuisine: 'Mughlai', priceRange: 'low' },
      { name: 'Britannia & Co.', cuisine: 'Parsi', priceRange: 'medium' },
      { name: 'Gajalee', cuisine: 'Seafood', priceRange: 'medium' }
    ],
    weather: {
      summer: '25°C - 35°C',
      winter: '15°C - 30°C',
      monsoon: '25°C - 30°C'
    },
    howToReach: {
      byAir: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
      byTrain: 'Chhatrapati Shivaji Maharaj Terminus, Mumbai Central',
      byRoad: 'Well connected by NH3, NH4, NH8, NH17'
    }
  },
  {
    name: 'Bangalore',
    location: {
      address: 'Bangalore, Karnataka, India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    description: 'The Garden City and India\'s Silicon Valley, known for its pleasant weather, parks, and vibrant nightlife.',
    images: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800'
    ],
    type: ['city', 'nature', 'tech'],
    state: 'Karnataka',
    rating: 4.4,
    thingsToDo: [
      { name: 'Lalbagh Botanical Garden', category: 'nature', estimatedCost: 25 },
      { name: 'Bangalore Palace', category: 'historical', estimatedCost: 230 },
      { name: 'Cubbon Park', category: 'nature', estimatedCost: 0 },
      { name: 'ISKCON Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Commercial Street Shopping', category: 'shopping', estimatedCost: 1000 },
      { name: 'UB City Mall', category: 'shopping', estimatedCost: 2000 },
      { name: 'Wonderla Amusement Park', category: 'entertainment', estimatedCost: 1000 },
      { name: 'Bannerghatta National Park', category: 'wildlife', estimatedCost: 80 }
    ],
    bestTimeToVisit: 'October to February',
    idealDuration: '2-3 days',
    budgetRange: { min: 2000, max: 12000 },
    attractions: [
      { name: 'Bangalore Palace', type: 'monument', entryFee: 230 },
      { name: 'Lalbagh Botanical Garden', type: 'park', entryFee: 25 },
      { name: 'Vidhana Soudha', type: 'monument', entryFee: 0 },
      { name: 'Tipu Sultan\'s Summer Palace', type: 'historical', entryFee: 15 },
      { name: 'Nandi Hills', type: 'nature', entryFee: 10 }
    ],
    restaurants: [
      { name: 'MTR', cuisine: 'South Indian', priceRange: 'low' },
      { name: 'Vidyarthi Bhavan', cuisine: 'South Indian', priceRange: 'low' },
      { name: 'Toit', cuisine: 'Continental', priceRange: 'medium' },
      { name: 'Karavalli', cuisine: 'Coastal', priceRange: 'high' }
    ],
    weather: {
      summer: '20°C - 35°C',
      winter: '12°C - 28°C',
      monsoon: '20°C - 28°C'
    },
    howToReach: {
      byAir: 'Kempegowda International Airport (BLR)',
      byTrain: 'Bangalore City Railway Station, Yesvantpur Junction',
      byRoad: 'Well connected by NH4, NH7, NH44, NH48'
    }
  },
  {
    name: 'Pune',
    location: {
      address: 'Pune, Maharashtra, India',
      coordinates: { lat: 18.5204, lng: 73.8567 }
    },
    description: 'The Oxford of the East, a cultural hub with historic forts, educational institutions, and pleasant weather.',
    images: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1561361058-4e5a6b1b5e5f?w=800'
    ],
    type: ['city', 'historical', 'educational'],
    state: 'Maharashtra',
    rating: 4.3,
    thingsToDo: [
      { name: 'Shaniwar Wada', category: 'historical', estimatedCost: 25 },
      { name: 'Aga Khan Palace', category: 'historical', estimatedCost: 25 },
      { name: 'Sinhagad Fort', category: 'adventure', estimatedCost: 0 },
      { name: 'Dagdusheth Halwai Ganpati Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Koregaon Park', category: 'shopping', estimatedCost: 1000 },
      { name: 'Raja Dinkar Kelkar Museum', category: 'museum', estimatedCost: 50 },
      { name: 'Parvati Hill', category: 'nature', estimatedCost: 0 },
      { name: 'Phoenix Marketcity', category: 'shopping', estimatedCost: 1500 }
    ],
    bestTimeToVisit: 'October to March',
    idealDuration: '2-3 days',
    budgetRange: { min: 1500, max: 10000 },
    attractions: [
      { name: 'Shaniwar Wada', type: 'fort', entryFee: 25 },
      { name: 'Aga Khan Palace', type: 'historical', entryFee: 25 },
      { name: 'Sinhagad Fort', type: 'fort', entryFee: 0 },
      { name: 'Dagdusheth Halwai Ganpati Temple', type: 'religious', entryFee: 0 },
      { name: 'Pataleshwar Cave Temple', type: 'religious', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Vaishali', cuisine: 'South Indian', priceRange: 'low' },
      { name: 'Good Luck Cafe', cuisine: 'Irani', priceRange: 'low' },
      { name: 'Malaka Spice', cuisine: 'Asian', priceRange: 'medium' },
      { name: 'Savya Rasa', cuisine: 'South Indian', priceRange: 'high' }
    ],
    weather: {
      summer: '20°C - 38°C',
      winter: '10°C - 28°C',
      monsoon: '20°C - 30°C'
    },
    howToReach: {
      byAir: 'Pune International Airport (PNQ)',
      byTrain: 'Pune Junction Railway Station',
      byRoad: 'Well connected by NH4, NH9, NH50'
    }
  },
  // Hill Stations
  {
    name: 'Manali',
    location: {
      address: 'Manali, Himachal Pradesh, India',
      coordinates: { lat: 32.2432, lng: 77.1892 }
    },
    description: 'A picturesque hill station in the Himalayas, famous for adventure sports, snow-capped peaks, and scenic beauty.',
    images: [
      'https://images.unsplash.com/photo-1626014353757-1c879a475cc3?w=800',
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800'
    ],
    type: ['mountain', 'adventure', 'nature'],
    state: 'Himachal Pradesh',
    rating: 4.7,
    thingsToDo: [
      { name: 'Solang Valley', category: 'adventure', estimatedCost: 500 },
      { name: 'Rohtang Pass', category: 'sightseeing', estimatedCost: 550 },
      { name: 'Hadimba Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Old Manali', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Paragliding', category: 'adventure', estimatedCost: 2500 },
      { name: 'River Rafting', category: 'adventure', estimatedCost: 1500 },
      { name: 'Trekking to Hampta Pass', category: 'adventure', estimatedCost: 5000 },
      { name: 'Hot Springs at Vashisht', category: 'relaxation', estimatedCost: 0 }
    ],
    bestTimeToVisit: 'March to June, October to February',
    idealDuration: '3-5 days',
    budgetRange: { min: 3000, max: 20000 },
    attractions: [
      { name: 'Hadimba Devi Temple', type: 'religious', entryFee: 0 },
      { name: 'Solang Valley', type: 'nature', entryFee: 0 },
      { name: 'Rohtang Pass', type: 'nature', entryFee: 550 },
      { name: 'Manu Temple', type: 'religious', entryFee: 0 },
      { name: 'Vashisht Hot Springs', type: 'nature', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Cafe 1947', cuisine: 'Multi-cuisine', priceRange: 'medium' },
      { name: 'Johnson\'s Cafe', cuisine: 'Continental', priceRange: 'medium' },
      { name: 'Drifters\' Inn', cuisine: 'Israeli', priceRange: 'low' },
      { name: 'The Lazy Dog', cuisine: 'Asian', priceRange: 'medium' }
    ],
    weather: {
      summer: '10°C - 25°C',
      winter: '-5°C - 10°C',
      monsoon: '15°C - 25°C'
    },
    howToReach: {
      byAir: 'Kullu-Manali Airport (KUU) - 50 km away',
      byTrain: 'Joginder Nagar Railway Station - 165 km away',
      byRoad: 'Well connected by NH3 from Delhi and Chandigarh'
    }
  },
  {
    name: 'Shimla',
    location: {
      address: 'Shimla, Himachal Pradesh, India',
      coordinates: { lat: 31.1048, lng: 77.1734 }
    },
    description: 'The Queen of Hills, a colonial-era hill station with charming architecture, toy train, and panoramic views.',
    images: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1626014353757-1c879a475cc3?w=800'
    ],
    type: ['mountain', 'historical', 'nature'],
    state: 'Himachal Pradesh',
    rating: 4.5,
    thingsToDo: [
      { name: 'The Ridge', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Mall Road', category: 'shopping', estimatedCost: 1000 },
      { name: 'Kufri', category: 'adventure', estimatedCost: 500 },
      { name: 'Jakhoo Temple', category: 'religious', estimatedCost: 0 },
      { name: 'Toy Train Ride', category: 'experience', estimatedCost: 500 },
      { name: 'Christ Church', category: 'historical', estimatedCost: 0 },
      { name: 'Indian Institute of Advanced Study', category: 'historical', estimatedCost: 40 },
      { name: 'Tara Devi Temple', category: 'religious', estimatedCost: 0 }
    ],
    bestTimeToVisit: 'March to June, October to February',
    idealDuration: '2-3 days',
    budgetRange: { min: 2500, max: 15000 },
    attractions: [
      { name: 'The Ridge', type: 'landmark', entryFee: 0 },
      { name: 'Christ Church', type: 'religious', entryFee: 0 },
      { name: 'Jakhoo Temple', type: 'religious', entryFee: 0 },
      { name: 'Kufri', type: 'nature', entryFee: 0 },
      { name: 'Green Valley', type: 'nature', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Cafe Sol', cuisine: 'Multi-cuisine', priceRange: 'medium' },
      { name: 'Indian Coffee House', cuisine: 'Cafe', priceRange: 'low' },
      { name: 'Baljees', cuisine: 'Bakery', priceRange: 'low' },
      { name: 'The Oberoi Cecil', cuisine: 'Fine Dining', priceRange: 'high' }
    ],
    weather: {
      summer: '15°C - 28°C',
      winter: '-2°C - 10°C',
      monsoon: '15°C - 25°C'
    },
    howToReach: {
      byAir: 'Shimla Airport (SLV) - 22 km away',
      byTrain: 'Shimla Railway Station (Toy Train from Kalka)',
      byRoad: 'Well connected by NH5 from Delhi and Chandigarh'
    }
  },
  {
    name: 'Srinagar',
    location: {
      address: 'Srinagar, Jammu & Kashmir, India',
      coordinates: { lat: 34.0837, lng: 74.7973 }
    },
    description: 'The summer capital of Kashmir, famous for its beautiful Dal Lake, houseboats, Mughal gardens, and shikara rides.',
    images: [
      'https://images.unsplash.com/photo-1566837497312-7be783781a34?w=800',
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800'
    ],
    type: ['mountain', 'nature', 'cultural'],
    state: 'Jammu & Kashmir',
    rating: 4.8,
    thingsToDo: [
      { name: 'Dal Lake Shikara Ride', category: 'experience', estimatedCost: 500 },
      { name: 'Stay in Houseboat', category: 'experience', estimatedCost: 3000 },
      { name: 'Shalimar Bagh', category: 'sightseeing', estimatedCost: 24 },
      { name: 'Nishat Bagh', category: 'sightseeing', estimatedCost: 24 },
      { name: 'Gulmarg Day Trip', category: 'adventure', estimatedCost: 2000 },
      { name: 'Pahalgam Day Trip', category: 'nature', estimatedCost: 2000 },
      { name: 'Hazratbal Shrine', category: 'religious', estimatedCost: 0 },
      { name: 'Floating Market', category: 'shopping', estimatedCost: 1000 }
    ],
    bestTimeToVisit: 'April to October',
    idealDuration: '3-5 days',
    budgetRange: { min: 4000, max: 25000 },
    attractions: [
      { name: 'Dal Lake', type: 'lake', entryFee: 0 },
      { name: 'Shalimar Bagh', type: 'garden', entryFee: 24 },
      { name: 'Nishat Bagh', type: 'garden', entryFee: 24 },
      { name: 'Chashme Shahi', type: 'garden', entryFee: 24 },
      { name: 'Hazratbal Shrine', type: 'religious', entryFee: 0 },
      { name: 'Jama Masjid', type: 'religious', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Ahdoos', cuisine: 'Kashmiri Wazwan', priceRange: 'medium' },
      { name: 'Shamyana Restaurant', cuisine: 'Multi-cuisine', priceRange: 'medium' },
      { name: 'Mughal Darbar', cuisine: 'Kashmiri', priceRange: 'low' },
      { name: 'Lhasa Restaurant', cuisine: 'Tibetan', priceRange: 'low' }
    ],
    weather: {
      summer: '15°C - 30°C',
      winter: '-5°C - 10°C',
      monsoon: '15°C - 25°C'
    },
    howToReach: {
      byAir: 'Sheikh ul-Alam International Airport (SXR)',
      byTrain: 'Jammu Tawi Railway Station - 270 km away',
      byRoad: 'Well connected by NH1A from Jammu'
    }
  },
  // Northeast
  {
    name: 'Shillong',
    location: {
      address: 'Shillong, Meghalaya, India',
      coordinates: { lat: 25.5788, lng: 91.8933 }
    },
    description: 'The Scotland of the East, known for its rolling hills, waterfalls, living root bridges, and vibrant music scene.',
    images: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1626014353757-1c879a475cc3?w=800'
    ],
    type: ['mountain', 'nature', 'cultural'],
    state: 'Meghalaya',
    rating: 4.6,
    thingsToDo: [
      { name: 'Living Root Bridges', category: 'nature', estimatedCost: 500 },
      { name: 'Elephant Falls', category: 'nature', estimatedCost: 20 },
      { name: 'Shillong Peak', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Police Bazar', category: 'shopping', estimatedCost: 1000 },
      { name: 'Don Bosco Museum', category: 'museum', estimatedCost: 100 },
      { name: 'Umiam Lake', category: 'nature', estimatedCost: 0 },
      { name: 'Mawlynnong Village', category: 'sightseeing', estimatedCost: 500 },
      { name: 'Cherrapunji', category: 'nature', estimatedCost: 500 }
    ],
    bestTimeToVisit: 'September to May',
    idealDuration: '3-4 days',
    budgetRange: { min: 2500, max: 15000 },
    attractions: [
      { name: 'Elephant Falls', type: 'waterfall', entryFee: 20 },
      { name: 'Shillong Peak', type: 'viewpoint', entryFee: 0 },
      { name: 'Don Bosco Museum', type: 'museum', entryFee: 100 },
      { name: 'Umiam Lake', type: 'lake', entryFee: 0 },
      { name: 'Cathedral of Mary Help of Christians', type: 'religious', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Jiva Grill', cuisine: 'Multi-cuisine', priceRange: 'medium' },
      { name: 'City Hut Family Dhaba', cuisine: 'North Indian', priceRange: 'low' },
      { name: 'Dylan\'s Cafe', cuisine: 'Cafe', priceRange: 'medium' },
      { name: 'Trattoria', cuisine: 'Khasi', priceRange: 'low' }
    ],
    weather: {
      summer: '15°C - 25°C',
      winter: '5°C - 15°C',
      monsoon: '15°C - 25°C'
    },
    howToReach: {
      byAir: 'Shillong Airport (SHL) - 30 km away, or Guwahati Airport - 100 km',
      byTrain: 'Guwahati Railway Station - 100 km away',
      byRoad: 'Well connected from Guwahati by NH6'
    }
  },
  // Kerala
  {
    name: 'Kochi',
    location: {
      address: 'Kochi, Kerala, India',
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    description: 'The Queen of the Arabian Sea, a port city with colonial history, Chinese fishing nets, and beautiful backwaters.',
    images: [
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800',
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800'
    ],
    type: ['city', 'beach', 'historical'],
    state: 'Kerala',
    rating: 4.5,
    thingsToDo: [
      { name: 'Fort Kochi', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Chinese Fishing Nets', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Kathakali Performance', category: 'cultural', estimatedCost: 300 },
      { name: 'Jew Town', category: 'shopping', estimatedCost: 1000 },
      { name: 'Backwater Cruise', category: 'experience', estimatedCost: 2000 },
      { name: 'Marine Drive', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Mattancherry Palace', category: 'historical', estimatedFee: 5 },
      { name: 'Paradesi Synagogue', category: 'historical', estimatedCost: 5 }
    ],
    bestTimeToVisit: 'October to March',
    idealDuration: '2-3 days',
    budgetRange: { min: 2000, max: 12000 },
    attractions: [
      { name: 'Fort Kochi', type: 'historical', entryFee: 0 },
      { name: 'Mattancherry Palace', type: 'museum', entryFee: 5 },
      { name: 'Paradesi Synagogue', type: 'religious', entryFee: 5 },
      { name: 'Hill Palace Museum', type: 'museum', entryFee: 30 },
      { name: 'Cherai Beach', type: 'beach', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Grand Pavilion', cuisine: 'Kerala', priceRange: 'medium' },
      { name: 'Oceanos', cuisine: 'Seafood', priceRange: 'medium' },
      { name: 'Kashi Art Cafe', cuisine: 'Cafe', priceRange: 'low' },
      { name: 'Fort House Restaurant', cuisine: 'Seafood', priceRange: 'medium' }
    ],
    weather: {
      summer: '25°C - 35°C',
      winter: '20°C - 32°C',
      monsoon: '23°C - 30°C'
    },
    howToReach: {
      byAir: 'Cochin International Airport (COK)',
      byTrain: 'Ernakulam Junction Railway Station',
      byRoad: 'Well connected by NH47, NH17'
    }
  },
  {
    name: 'Munnar',
    location: {
      address: 'Munnar, Kerala, India',
      coordinates: { lat: 10.0889, lng: 77.0595 }
    },
    description: 'A hill station in the Western Ghats known for tea plantations, misty mountains, and wildlife sanctuaries.',
    images: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1626014353757-1c879a475cc3?w=800'
    ],
    type: ['mountain', 'nature', 'plantation'],
    state: 'Kerala',
    rating: 4.7,
    thingsToDo: [
      { name: 'Tea Plantation Tour', category: 'experience', estimatedCost: 500 },
      { name: 'Eravikulam National Park', category: 'wildlife', estimatedCost: 200 },
      { name: 'Mattupetty Dam', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Kundala Lake', category: 'nature', estimatedCost: 0 },
      { name: 'Echo Point', category: 'sightseeing', estimatedCost: 0 },
      { name: 'Top Station', category: 'viewpoint', estimatedCost: 0 },
      { name: 'Attukal Waterfalls', category: 'nature', estimatedCost: 0 },
      { name: 'Tata Tea Museum', category: 'museum', estimatedCost: 75 }
    ],
    bestTimeToVisit: 'September to March',
    idealDuration: '2-3 days',
    budgetRange: { min: 2500, max: 15000 },
    attractions: [
      { name: 'Eravikulam National Park', type: 'wildlife', entryFee: 200 },
      { name: 'Mattupetty Dam', type: 'dam', entryFee: 0 },
      { name: 'Kundala Lake', type: 'lake', entryFee: 0 },
      { name: 'Echo Point', type: 'viewpoint', entryFee: 0 },
      { name: 'Tata Tea Museum', type: 'museum', entryFee: 75 }
    ],
    restaurants: [
      { name: 'Rapsy Restaurant', cuisine: 'Multi-cuisine', priceRange: 'low' },
      { name: 'Saravana Bhavan', cuisine: 'South Indian', priceRange: 'low' },
      { name: 'The Terrace', cuisine: 'Continental', priceRange: 'medium' },
      { name: 'Mattupetty Indo Swiss Farm', cuisine: 'Dairy', priceRange: 'low' }
    ],
    weather: {
      summer: '15°C - 25°C',
      winter: '10°C - 20°C',
      monsoon: '15°C - 22°C'
    },
    howToReach: {
      byAir: 'Cochin International Airport (COK) - 110 km away',
      byTrain: 'Aluva Railway Station - 110 km away',
      byRoad: 'Well connected from Kochi by NH49'
    }
  },
  // Goa
  {
    name: 'Goa',
    location: {
      address: 'Goa, India',
      coordinates: { lat: 15.2993, lng: 74.1240 }
    },
    description: 'India\'s beach paradise, famous for its sandy beaches, Portuguese heritage, nightlife, and seafood.',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800'
    ],
    type: ['beach', 'party', 'historical'],
    state: 'Goa',
    rating: 4.7,
    thingsToDo: [
      { name: 'Baga Beach', category: 'beach', estimatedCost: 0 },
      { name: 'Calangute Beach', category: 'beach', estimatedCost: 0 },
      { name: 'Basilica of Bom Jesus', category: 'religious', estimatedCost: 0 },
      { name: 'Dudhsagar Falls', category: 'nature', estimatedCost: 400 },
      { name: 'Fort Aguada', category: 'historical', estimatedCost: 0 },
      { name: 'Anjuna Flea Market', category: 'shopping', estimatedCost: 1000 },
      { name: 'Water Sports', category: 'adventure', estimatedCost: 1500 },
      { name: 'Cruise on Mandovi River', category: 'experience', estimatedCost: 500 }
    ],
    bestTimeToVisit: 'November to February',
    idealDuration: '3-5 days',
    budgetRange: { min: 3000, max: 25000 },
    attractions: [
      { name: 'Basilica of Bom Jesus', type: 'religious', entryFee: 0 },
      { name: 'Se Cathedral', type: 'religious', entryFee: 0 },
      { name: 'Fort Aguada', type: 'fort', entryFee: 0 },
      { name: 'Chapora Fort', type: 'fort', entryFee: 0 },
      { name: 'Dudhsagar Falls', type: 'waterfall', entryFee: 400 },
      { name: 'Anjuna Beach', type: 'beach', entryFee: 0 }
    ],
    restaurants: [
      { name: 'Fisherman\'s Wharf', cuisine: 'Seafood', priceRange: 'medium' },
      { name: 'Martin\'s Corner', cuisine: 'Goan', priceRange: 'medium' },
      { name: 'Britto\'s', cuisine: 'Seafood', priceRange: 'medium' },
      { name: 'Vinayak Family Restaurant', cuisine: 'Goan', priceRange: 'low' }
    ],
    weather: {
      summer: '25°C - 35°C',
      winter: '20°C - 32°C',
      monsoon: '24°C - 30°C'
    },
    howToReach: {
      byAir: 'Goa International Airport (Dabolim) - GOI, or Manohar International Airport (Mopa)',
      byTrain: 'Madgaon Railway Station, Thivim Railway Station',
      byRoad: 'Well connected by NH4, NH17 from Mumbai and Bangalore'
    }
  }
];

const seedPlaces = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing places
    await Place.deleteMany({});
    console.log('Cleared existing places');

    // Insert new places
    await Place.insertMany(places);
    console.log(`Seeded ${places.length} places successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedPlaces();

export default seedPlaces;
