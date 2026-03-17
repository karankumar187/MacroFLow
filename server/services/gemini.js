const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Parse natural language food input into structured macro data.
 * e.g., "2 eggs and a bowl of oatmeal with blueberries"
 */
async function parseFoodInput(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a precise nutrition database. Parse the following food description and return ONLY a valid JSON object (no markdown, no code fences).

Food description: "${text}"

Return this exact JSON structure:
{
  "foods": [
    {
      "food_name": "descriptive name of the food item",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fat": <number in grams>,
      "estimated_weight_g": <number in grams>
    }
  ]
}

Rules:
- Break the input into individual food items
- Use standard USDA-style nutritional data
- All numbers should be reasonable estimates
- Return ONLY the JSON, nothing else`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Clean the response - remove markdown code fences if present
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse Gemini response:', cleaned);
    throw new Error('Failed to parse food data from AI response');
  }
}

/**
 * Parse a food photo/label using Gemini Vision.
 */
async function parseFoodImage(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  const prompt = `Analyze this food image or nutrition label. Return ONLY a valid JSON object (no markdown, no code fences).

Return this exact JSON structure:
{
  "foods": [
    {
      "food_name": "descriptive name",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fat": <number in grams>,
      "estimated_weight_g": <number in grams>
    }
  ]
}

Rules:
- If it's a nutrition label, extract the exact values
- If it's a photo of food, estimate based on visual portion size
- All numbers should be realistic
- Return ONLY the JSON, nothing else`;

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response.text();
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse Gemini Vision response:', cleaned);
    throw new Error('Failed to parse food data from image');
  }
}

/**
 * AI Nutrition Coach chat — injects user profile + recent logs for context.
 */
async function chatWithCoach(message, userProfile, recentLogs) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build context from user data
  const logsContext = recentLogs.map(log => {
    const totals = log.meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return `Date: ${log.date} | Calories: ${totals.calories}/${userProfile.calorieGoal} | Protein: ${totals.protein}g/${userProfile.macroGoals.protein}g | Carbs: ${totals.carbs}g/${userProfile.macroGoals.carbs}g | Fat: ${totals.fat}g/${userProfile.macroGoals.fat}g | Meals: ${log.meals.map(m => m.foodName).join(', ')}`;
  }).join('\n');

  const systemPrompt = `You are MacroFlow AI Coach — a friendly, knowledgeable nutrition coach. You have access to the user's profile and recent food logs.

USER PROFILE:
- Name: ${userProfile.name}
- Current Weight: ${userProfile.currentWeight}kg | Target: ${userProfile.targetWeight}kg
- Diet Style: ${userProfile.dietStyle}
- Activity Level: ${userProfile.activityLevel}
- Daily Calorie Goal: ${userProfile.calorieGoal} kcal
- Macro Goals: Protein ${userProfile.macroGoals.protein}g | Carbs ${userProfile.macroGoals.carbs}g | Fat ${userProfile.macroGoals.fat}g
- TDEE: ${userProfile.tdee} kcal

RECENT FOOD LOGS (Last 3 days):
${logsContext || 'No logs available yet.'}

INSTRUCTIONS:
- Be encouraging but honest
- Give specific, actionable advice
- Reference their actual intake data when relevant
- Suggest meals/recipes when asked
- Keep responses concise and friendly
- Use emojis sparingly for warmth`;

  const chat = model.startChat({
    history: [],
    systemInstruction: systemPrompt
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

module.exports = { parseFoodInput, parseFoodImage, chatWithCoach };
