import { ollamaEmbeddings } from "langchain/embeddings/ollama";

const embeddings = new ollamaEmbeddings({
  baseUrl: process.env.OLLAMA_BASE_URL,
});

export async function getEmbedding(vehicleType: string, interiorCondition: number, exteriorCondition: number): Promise<number[]> {
  const embeddingInput = `${vehicleType} ${interiorCondition} ${exteriorCondition}`;
  const embedding = await embeddings.embedText(embeddingInput);
  return embedding;
}
