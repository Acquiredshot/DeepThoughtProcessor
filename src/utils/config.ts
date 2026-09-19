import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const CONFIG = {
  // .trim() removes any accidental hidden spaces or newline characters
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY?.trim(),
  TAVILY_API_KEY: process.env.TAVILY_API_KEY?.trim(),
};

console.log('--------------------------------------------------');
console.log('🔧 CONFIG CHECK:');
console.log(`ANTHROPIC_API_KEY: ${CONFIG.ANTHROPIC_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
console.log(`TAVILY_API_KEY: ${CONFIG.TAVILY_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
console.log('--------------------------------------------------');

if (!CONFIG.ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY is not set in .env');
}
