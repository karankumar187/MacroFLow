const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Parse natural language food input into structured macro data.
 */
async function parseFoodInput(text) {
  const prompt = `You are an expert nutrition AI and strict JSON API. Parse this food and return ONLY valid JSON.

Input: "${text}"

Return EXACTLY this JSON structure, nothing else:
{"foods":[{"food_name":"name","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"estimated_weight_g":0}]}

Rules:
- NEVER mix up macronutrients! Pay extremely close attention to the definition of "protein", "carbs" and "fat". For example, meat has high protein/zero carbs, bread has high carbs/low protein. Do NOT swap these values!
- Make reasonable estimates for portions and macros, including dietary fiber.
- Do not wrap in markdown \`\`\`
- Return ONLY the raw JSON string`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error(`No JSON found in response: ${cleaned}`);
    }
    
    const jsonStr = cleaned.slice(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini parseFoodInput failed:', error);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

/**
 * Parse a food photo
 */
async function parseFoodImage(imageBuffer, mimeType) {
  const prompt = `You are a strict JSON API. Analyze this food image and return ONLY valid JSON.

Return EXACTLY this JSON structure, nothing else:
{"foods":[{"food_name":"name","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"estimated_weight_g":0}]}

Rules:
- Estimate the foods shown, their portions, and macros+fiber.
- NEVER mix up macronutrients!
- Do not wrap in markdown \`\`\`
- Return ONLY the raw JSON string`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const content = result.response.text().trim();
    
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error(`No JSON found in response: ${cleaned}`);
    }
    
    const jsonStr = cleaned.slice(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini parseFoodImage failed:', error);
    throw new Error(`Gemini Vision Error: ${error.message}`);
  }
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

  const systemPrompt = `You are MacroFlow AI Coach — a concise, friendly nutrition coach.
User: ${userProfile.name}, ${userProfile.currentWeight}kg -> ${userProfile.targetWeight}kg
Goal: ${userProfile.calorieGoal} kcal/day
Recent Logs: ${logsContext || 'None'}
Keep responses short, actionable, and encouraging.`;

  try {
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. I'm ready to coach!" }] } // Acknowledge system prompt
      ]
    });
    
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chatWithCoach failed:', error);
    throw new Error('Coach is currently unavailable. Please try again later.');
  }
}

module.exports = { parseFoodInput, parseFoodImage, chatWithCoach };
