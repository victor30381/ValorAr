
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
    console.error('Error: GOOGLE_GENAI_API_KEY not found in .env file');
    process.exit(1);
}

// Check if we are running in a browser environment (which is not supported for this script)
if (typeof window !== 'undefined') {
    console.error('Error: This script is intended to run in a Node.js environment, not the browser.');
    process.exit(1);
}

console.log('Initializing Genkit with Google AI...');

const ai = genkit({
    plugins: [googleAI({ apiKey })],
    model: gemini15Flash,
});

const helloFlow = ai.defineFlow('helloFlow', async (name) => {
    console.log(`Generating greeting for ${name}...`);
    try {
        const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
        console.log('Response:', text);
        return text;
    } catch (error: any) {
        console.error('Error generating text:', error.message);
        if (error.status === 404) {
            console.error('\nPOSSIBLE CAUSES FOR 404 ERROR:');
            console.error('1. The model "gemini-1.5-flash" is not enabled for your API key.');
            console.error('2. You are using an API key from a project that has not enabled the Generative Language API.');
            console.error('3. Check your project settings in Google AI Studio: https://aistudio.google.com/');
        }
        throw error;
    }
});

// Execute the flow
helloFlow('Victor').catch(_err => {
    console.error('Flow failed');
});
