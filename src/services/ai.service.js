import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const generateAIItinerary = async ({
  destination,
  duration,
  budget,
  travelers,
  preferences,
  travelStyle
}) => {
  try {
    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}, India.
Budget: ₹${budget} INR for ${travelers} travelers
Travel Style: ${travelStyle}
Preferences: ${preferences?.join(', ') || 'general sightseeing'}

Generate a day-by-day itinerary with activities. For each day, provide:
- 3-5 activities with specific times
- Activity names and brief descriptions
- Recommended type (sightseeing, food, transport, accommodation, activity)
- Estimated cost in INR
- Duration in hours

Format the response as a JSON array of days, where each day has:
{
  "dayNumber": number,
  "activities": [
    {
      "time": "HH:MM",
      "title": "Activity name",
      "description": "Brief description",
      "type": "sightseeing|food|transport|accommodation|activity",
      "duration": number,
      "cost": number
    }
  ],
  "notes": "Any special notes for the day"
}

Only return the JSON, no additional text.`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text;
    console.log('AI response:', text);
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const itinerary = JSON.parse(jsonMatch[0]);
      
      // Add IDs and default values
      return itinerary.map((day, dayIndex) => ({
        date: new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000),
        dayNumber: day.dayNumber || dayIndex + 1,
        activities: day.activities.map((activity, actIndex) => ({
          _id: `act-${dayIndex}-${actIndex}`,
          time: activity.time || '09:00',
          title: activity.title,
          description: activity.description || '',
          type: activity.type || 'sightseeing',
          duration: activity.duration || 1,
          cost: activity.cost || 0,
          isCompleted: false
        })),
        notes: day.notes || ''
      }));
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI itinerary generation error:', error);
    
    // Return fallback itinerary
    return generateFallbackItinerary(destination, duration);
  }
};

export const getAIRecommendations = async ({
  destination,
  preferences,
  budget
}) => {
  try {
    const prompt = `Suggest 5 hidden gems and local favorites in ${destination}, India.
Budget: ₹${budget || 5000} per person
Preferences: ${preferences?.join(', ') || 'general'}

For each recommendation, provide:
- Name of the place
- Brief description
- Category (cafe, restaurant, activity, hidden_gem, viewpoint)
- Estimated cost in INR
- Best time to visit
- Why it's recommended

Format as JSON array:
[{
  "title": "Place name",
  "description": "Description",
  "category": "category",
  "estimatedCost": number,
  "bestTime": "morning|afternoon|evening",
  "whyRecommended": "Reason"
}]

Only return the JSON.`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI recommendations error:', error);
    return generateFallbackRecommendations(destination);
  }
};

export const getPackingSuggestions = async ({
  destination,
  weather,
  duration,
  activities
}) => {
  try {
    const prompt = `Create a packing list for a ${duration}-day trip to ${destination}, India.
Expected weather: ${weather || 'mixed'}
Planned activities: ${activities?.join(', ') || 'general sightseeing'}

Provide a comprehensive packing list with items organized by category:
- essentials
- clothing
- toiletries
- electronics
- health
- documents
- misc

For each item, indicate if it's essential.

Format as JSON:
[{
  "name": "Item name",
  "category": "category",
  "isEssential": boolean,
  "quantity": number,
  "notes": "optional notes"
}]

Only return the JSON.`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI packing suggestions error:', error);
    return generateFallbackPackingList(duration);
  }
};

export const getBudgetOptimization = async ({
  currentBudget,
  destination,
  duration
}) => {
  try {
    const prompt = `Suggest budget optimization tips for a ${duration}-day trip to ${destination}, India with a budget of ₹${currentBudget}.

Provide suggestions for each category:
- Accommodation
- Food
- Transport
- Activities

For each category, suggest:
- Current estimated allocation
- Suggested allocation
- Money-saving tip

Format as JSON:
[{
  "category": "category name",
  "current": number,
  "suggested": number,
  "tip": "money-saving tip"
}]

Only return the JSON.`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI budget optimization error:', error);
    return generateFallbackBudgetTips(currentBudget);
  }
};

// Fallback functions
const generateFallbackItinerary = (destination, duration) => {
  const activities = [
    { time: '08:00', title: 'Breakfast at Local Cafe', type: 'food', duration: 1, cost: 300 },
    { time: '10:00', title: `Explore ${destination}`, type: 'sightseeing', duration: 3, cost: 500 },
    { time: '14:00', title: 'Lunch Break', type: 'food', duration: 1, cost: 400 },
    { time: '16:00', title: 'Local Sightseeing', type: 'sightseeing', duration: 2, cost: 300 },
    { time: '19:00', title: 'Dinner & Rest', type: 'food', duration: 2, cost: 600 }
  ];

  return Array.from({ length: duration }, (_, i) => ({
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
    dayNumber: i + 1,
    activities: activities.map((act, j) => ({
      _id: `act-${i}-${j}`,
      ...act,
      description: `Enjoy ${act.title.toLowerCase()} in ${destination}`
    })),
    notes: `Day ${i + 1} of your ${destination} adventure`
  }));
};

const generateFallbackRecommendations = (destination) => {
  return [
    {
      title: 'Hidden Valley Cafe',
      description: 'A cozy cafe tucked away from the tourist crowds',
      category: 'cafe',
      estimatedCost: 500,
      bestTime: 'morning',
      whyRecommended: 'Perfect for breakfast before exploring'
    },
    {
      title: 'Sunset Viewpoint',
      description: 'Best panoramic views of the area',
      category: 'viewpoint',
      estimatedCost: 0,
      bestTime: 'evening',
      whyRecommended: 'Stunning sunset views'
    },
    {
      title: 'Local Market',
      description: 'Authentic local shopping experience',
      category: 'activity',
      estimatedCost: 1000,
      bestTime: 'afternoon',
      whyRecommended: 'Great for souvenirs and local crafts'
    }
  ];
};

const generateFallbackPackingList = (duration) => {
  return [
    { name: 'Passport/ID', category: 'documents', isEssential: true, quantity: 1 },
    { name: 'Phone Charger', category: 'electronics', isEssential: true, quantity: 1 },
    { name: 'Power Bank', category: 'electronics', isEssential: true, quantity: 1 },
    { name: 'Comfortable Shoes', category: 'clothing', isEssential: true, quantity: 1 },
    { name: 'Weather-appropriate Clothing', category: 'clothing', isEssential: true, quantity: duration + 1 },
    { name: 'Toiletries', category: 'toiletries', isEssential: true, quantity: 1 },
    { name: 'First Aid Kit', category: 'health', isEssential: true, quantity: 1 },
    { name: 'Water Bottle', category: 'essentials', isEssential: true, quantity: 1 }
  ];
};

const generateFallbackBudgetTips = (budget) => {
  return [
    {
      category: 'Accommodation',
      current: Math.round(budget * 0.4),
      suggested: Math.round(budget * 0.3),
      tip: 'Consider homestays or hostels for authentic experience'
    },
    {
      category: 'Food',
      current: Math.round(budget * 0.25),
      suggested: Math.round(budget * 0.2),
      tip: 'Eat at local dhabas and street food stalls'
    },
    {
      category: 'Transport',
      current: Math.round(budget * 0.2),
      suggested: Math.round(budget * 0.15),
      tip: 'Use public transport or share rides'
    },
    {
      category: 'Activities',
      current: Math.round(budget * 0.15),
      suggested: Math.round(budget * 0.15),
      tip: 'Look for free walking tours and nature trails'
    }
  ];
};

export default {
  generateAIItinerary,
  getAIRecommendations,
  getPackingSuggestions,
  getBudgetOptimization
};
