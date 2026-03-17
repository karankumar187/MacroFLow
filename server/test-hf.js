const { HfInference } = require('@huggingface/inference');
const hf = new HfInference(process.env.HF_API_KEY);

const models = [
  'microsoft/Phi-3.5-mini-instruct',
  'Qwen/Qwen2.5-1.5B-Instruct',
  'Qwen/Qwen2.5-Coder-32B-Instruct',
  'google/gemma-2-2b-it'
];

async function test() {
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const res = await hf.chatCompletion({
        model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      });
      console.log(`SUCCESS: ${model}`);
      return;
    } catch (e) {
      console.log(`FAILED: ${model} -> ${e.message}`);
    }
  }
}
test();
