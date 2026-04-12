# Nomadic View Backend API

A comprehensive backend API for Nomadic View - a travel itinerary planning application focused on Indian destinations.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Trip Management**: Create, manage, and share travel itineraries
- **AI-Powered Itinerary Generation**: Using Google's Gemini AI
- **Real-time Collaboration**: Socket.io for live trip updates
- **Expense Splitting**: Smart expense management with settlement calculations
- **Document Vault**: Secure document storage with Cloudinary
- **Weather Integration**: OpenWeatherMap API for real-time weather data
- **Maps Integration**: Google Maps API for geocoding, directions, and places
- **QR Code Generation**: Share trips via QR codes
- **PDF Export**: Generate and download trip itineraries as PDF

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer + Cloudinary
- **AI**: Google Gemini API
- **External APIs**: Google Maps, OpenWeatherMap

## Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account or local MongoDB instance
- API keys for:
  - Google Maps API
  - OpenWeatherMap API
  - Google Gemini API
  - Cloudinary (for file uploads)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

4. Seed the database with places:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/search` - Search users
- `GET /api/users/saved-places` - Get saved places
- `GET /api/users/notifications` - Get notifications

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip by ID
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/activities` - Add activity
- `POST /api/trips/:id/generate-itinerary` - Generate AI itinerary
- `GET /api/trips/:id/export` - Export trip as PDF

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `GET /api/places/search` - Search places
- `GET /api/places/state/:state` - Get places by state
- `GET /api/places/type/:type` - Get places by type
- `GET /api/places/nearby` - Get nearby places

### Expenses
- `GET /api/expenses/trip/:tripId` - Get trip expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/trip/:tripId/settlements` - Get settlements
- `GET /api/expenses/trip/:tripId/summary` - Get expense summary

### Documents
- `GET /api/documents/trip/:tripId` - Get trip documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

### AI Services
- `POST /api/ai/itinerary` - Generate AI itinerary
- `POST /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/packing-list` - Get AI packing list
- `POST /api/ai/budget-tips` - Get budget optimization tips
- `POST /api/ai/chat` - Chat with AI assistant

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast
- `POST /api/weather/batch` - Get batch weather data

### Maps
- `GET /api/maps/geocode` - Geocode address
- `GET /api/maps/reverse-geocode` - Reverse geocode
- `GET /api/maps/place/:placeId` - Get place details
- `GET /api/maps/nearby` - Search nearby places
- `GET /api/maps/directions` - Get directions
- `GET /api/maps/autocomplete` - Autocomplete places
- `GET /api/maps/emergency-services` - Get emergency services

### Share
- `POST /api/share/trip/:tripId` - Generate share link
- `GET /api/share/trip/:token` - Get shared trip
- `GET /api/share/trip/:tripId/qr` - Generate QR code
- `POST /api/share/trip/:tripId/invite` - Invite user

## Available Destinations

The API includes comprehensive data for the following Indian destinations:

### Metro Cities
- **New Delhi** - Capital city with rich history
- **Mumbai** - Financial capital and Bollywood hub
- **Bangalore** - Silicon Valley of India
- **Pune** - Oxford of the East

### Hill Stations
- **Manali** - Adventure capital of Himachal
- **Shimla** - Queen of Hills
- **Srinagar** - Paradise on Earth (Kashmir)

### Northeast
- **Shillong** - Scotland of the East (Meghalaya)

### South India
- **Kochi** - Queen of Arabian Sea (Kerala)
- **Munnar** - Tea plantation hills (Kerala)

### Beach Destinations
- **Goa** - India's beach paradise

## Postman Collection

A complete Postman collection is available at `/postman/NomadicView_API_Collection.json`. Import this file into Postman to test all API endpoints.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with places data
- `npm test` - Run tests

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@nomadicview.com or join our Slack channel.
