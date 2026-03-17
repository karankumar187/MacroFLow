const { OpenAI } = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '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', // free tier fallback key
  // We use openrouter for reliable free models without rate limits
});

const MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

/**
 * Parse natural language food input into structured macro data.
 */
async function parseFoodInput(text) {
  const prompt = `You are a strict JSON API. Parse this food and return ONLY valid JSON.

Input: "${text}"

Return EXACTLY this JSON structure, nothing else:
{"foods":[{"food_name":"name","calories":0,"protein":0,"carbs":0,"fat":0,"estimated_weight_g":0}]}

Rules:
- Make reasonable estimates for portions and macros
- Do not wrap in markdown \`\`\`
- Return ONLY the raw JSON string`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in response');
    
    const jsonStr = cleaned.slice(start, end + 1);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error('OpenRouter parseFoodInput failed:', error);
    throw new Error(`AI API Error: ${error.message}`);
  }
}

/**
 * Parse a food photo
 */
async function parseFoodImage(imageBuffer, mimeType) {
  throw new Error('Photo parsing is not available on HuggingFace free tier. Please use text input instead.');
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

    return `Date: ${log.date} | Cals: ${totals.calories}/${userProfile.calorieGoal} | P: ${totals.protein}g C: ${totals.carbs}g F: ${totals.fat}g`;
  }).join('\n');

  const system = `You are MacroFlow AI Coach — a concise, friendly nutrition coach.
User: ${userProfile.name}, ${userProfile.currentWeight}kg -> ${userProfile.targetWeight}kg
Goal: ${userProfile.calorieGoal} kcal/day
Recent Logs: ${logsContext || 'None'}
Keep responses short, actionable, and encouraging.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter chatWithCoach failed:', error);
    throw new Error('Coach is currently unavailable. Please try again later.');
  }
}

module.exports = { parseFoodInput, parseFoodImage, chatWithCoach };
