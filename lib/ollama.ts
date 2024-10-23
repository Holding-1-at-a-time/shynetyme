import { RunnableSequence, PromptTemplate, StringOutputParser } from 'langchain/chains';
import { Ollama } from 'langchain/llms/ollama';

const ollamaOptions: OllamaOptions = {
  baseUrl: process.env.OLLAMA_BASE_URL as string, // Set this in your .env file
  model: "llama3.2:3b",
};
const ollama = new Ollama(ollamaOptions);

const template = `You are an AI assistant for an auto detailing pricing system. Given the following vehicle details and historical data, provide a pricing recommendation and explanation.

Vehicle Details:
{vehicleDetails}

Historical Data:
{historicalData}

Provide your recommendation in the following JSON format:
{
  "recommendedPrice": number,
  "explanation": string,
  "confidenceScore": number
}
`;

const prompt = PromptTemplate.fromTemplate<string, { vehicleDetails: string; historicalData: string }>(template);

const outputParser = new StringOutputParser<{ recommendedPrice: number; explanation: string; confidenceScore: number }>();

export const pricingChain: RunnableSequence<{ vehicleDetails: string; historicalData: string }, { recommendedPrice: number; explanation: string; confidenceScore: number }> = RunnableSequence.from([prompt, ollama, outputParser]);

