/**
 * AI Service — HuggingFace Inference API
 * Uses Qwen/Qwen2.5-72B-Instruct (free tier)
 */

const HF_MODEL = 'meta-llama/Llama-3.2-3B-Instruct';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`;

async function hfChat(messages, maxTokens = 1024) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`HuggingFace API error: ${response.status}`, errText);
    throw new Error(`HuggingFace Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Parse natural language food input into structured macro data.
 */
async function parseFoodInput(text) {
  const messages = [
    {
      role: 'system',
      content: `You are a precise nutrition database. Parse food descriptions and return ONLY valid JSON. No markdown, no code fences, no explanation — just the JSON object.`
    },
    {
      role: 'user',
      content: `Parse this food description and return nutritional data as JSON:

Food: "${text}"

Return EXACTLY this structure:
{"foods":[{"food_name":"name","calories":0,"protein":0,"carbs":0,"fat":0,"estimated_weight_g":0}]}

Rules:
- Break input into individual food items
- Use standard USDA-style nutritional data
- All numbers should be reasonable estimates
- Return ONLY the JSON, nothing else`
    }
  ];

  const response = await hfChat(messages, 512);
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse HF response:', cleaned);
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse food data from AI response');
  }
}

/**
 * Parse food photo — HuggingFace free tier doesn't support vision,
 * so we'll extract text description and parse that instead.
 */
async function parseFoodImage(imageBuffer, mimeType) {
  // HuggingFace free chat models don't support images
  // Return a helpful error message
  throw new Error('Photo parsing is not available with the current AI provider. Please use text input instead.');
}

/**
 * AI Nutrition Coach chat
 */
async function chatWithCoach(message, userProfile, recentLogs) {
  const logsContext = recentLogs.map(log => {
    const totals = log.meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return `Date: ${log.date} | Calories: ${totals.calories}/${userProfile.calorieGoal} | Protein: ${totals.protein}g/${userProfile.macroGoals.protein}g | Carbs: ${totals.carbs}g/${userProfile.macroGoals.carbs}g | Fat: ${totals.fat}g/${userProfile.macroGoals.fat}g | Meals: ${log.meals.map(m => m.foodName).join(', ')}`;
  }).join('\n');

  const messages = [
    {
      role: 'system',
      content: `You are MacroFlow AI Coach — a friendly, knowledgeable nutrition coach.

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
- Keep responses concise and friendly
- Use emojis sparingly for warmth`
    },
    {
      role: 'user',
      content: message
    }
  ];

  return await hfChat(messages, 1024);
}

module.exports = { parseFoodInput, parseFoodImage, chatWithCoach };
