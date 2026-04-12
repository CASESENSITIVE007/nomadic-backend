import { asyncHandler } from '../middleware/errorHandler.js';
import { GoogleGenAI } from "@google/genai";
import {
  generateAIItinerary,
  getAIRecommendations,
  getPackingSuggestions,
  getBudgetOptimization
} from '../services/ai.service.js';


const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// @desc    Generate AI itinerary for a trip
// @route   POST /api/ai/itinerary
// @access  Private
export const generateItinerary = asyncHandler(async (req, res) => {
  const { destination, duration, budget, travelers, preferences, travelStyle } = req.body;

  if (!destination || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Destination and duration are required'
    });
  }

  const itinerary = await generateAIItinerary({
    destination,
    duration: parseInt(duration),
    budget: budget || 15000,
    travelers: travelers || 2,
    preferences: preferences || [],
    travelStyle: travelStyle || 'mixed'
  });

  res.json({
    success: true,
    message: 'Itinerary generated successfully',
    data: itinerary
  });
});

// @desc    Get AI recommendations for a destination
// @route   POST /api/ai/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req, res) => {
  const { destination, preferences, budget } = req.body;

  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'Destination is required'
    });
  }

  const recommendations = await getAIRecommendations({
    destination,
    preferences: preferences || [],
    budget: budget || 5000
  });

  res.json({
    success: true,
    message: 'Recommendations generated successfully',
    data: recommendations
  });
});

// @desc    Get AI-generated packing list
// @route   POST /api/ai/packing-list
// @access  Private
export const getPackingList = asyncHandler(async (req, res) => {
  const { destination, weather, duration, activities } = req.body;

  if (!destination || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Destination and duration are required'
    });
  }

  const packingList = await getPackingSuggestions({
    destination,
    weather: weather || 'mixed',
    duration: parseInt(duration),
    activities: activities || []
  });

  // Organize by category
  const organized = packingList.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({
    success: true,
    message: 'Packing list generated successfully',
    data: {
      items: packingList,
      organized,
      totalItems: packingList.length,
      essentialItems: packingList.filter(i => i.isEssential).length
    }
  });
});

// @desc    Get AI budget optimization tips
// @route   POST /api/ai/budget-tips
// @access  Private
export const getBudgetTips = asyncHandler(async (req, res) => {
  const { currentBudget, destination, duration } = req.body;

  if (!currentBudget || !destination || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Current budget, destination, and duration are required'
    });
  }

  const tips = await getBudgetOptimization({
    currentBudget: parseInt(currentBudget),
    destination,
    duration: parseInt(duration)
  });

  const totalCurrent = tips.reduce((sum, t) => sum + t.current, 0);
  const totalSuggested = tips.reduce((sum, t) => sum + t.suggested, 0);
  const potentialSavings = totalCurrent - totalSuggested;

  res.json({
    success: true,
    message: 'Budget tips generated successfully',
    data: {
      tips,
      summary: {
        totalCurrent,
        totalSuggested,
        potentialSavings,
        savingsPercentage: Math.round((potentialSavings / totalCurrent) * 100)
      }
    }
  });
});

// @desc    Chat with AI travel assistant
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = asyncHandler(async (req, res) => {
  const { message, context, tripId } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  try {
     const model = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    let systemPrompt = `You are Nomadic AI, a helpful travel assistant for Nomadic View, a travel itinerary website focused on Indian destinations. 
    
You provide friendly, concise advice about:
- Travel planning and itineraries
- Local recommendations for Indian cities and tourist spots
- Budget travel tips for India
- Cultural insights and etiquette
- Transportation options within India
- Food and dining recommendations
- Safety tips for travelers

Keep responses helpful, friendly, and focused on travel in India. Be concise but informative.`;

    if (context) {
      systemPrompt += `\n\nContext about the user's current trip: ${JSON.stringify(context)}`;
    }

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Understood! I am Nomadic AI, ready to help with your travel questions about India.' }]
        }
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    res.json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString(),
        tripId: tripId || null
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Fallback response
    const fallbackResponses = [
      "I'd be happy to help with your travel plans! Could you provide more details about your destination?",
      "That's a great question! For the best recommendations, could you tell me more about your travel dates and preferences?",
      "I'd love to assist! What specific information are you looking for about your trip?",
      "Thanks for reaching out! I'm here to help make your Indian travel experience amazing. What would you like to know?"
    ];
    
    res.json({
      success: true,
      data: {
        reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date().toISOString(),
        tripId: tripId || null,
        isFallback: true
      }
    });
  }
});

export default {
  generateItinerary,
  getRecommendations,
  getPackingList,
  getBudgetTips,
  chatWithAI
};
