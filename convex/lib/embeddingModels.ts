import type { EmbeddingModel } from "ai";
import { createHiknowClient, HIKNOW_EMBEDDING_MODEL } from "./hiknow";

// Do not mix vectors from different providers in an existing vector index.
export function getTextEmbeddingModel(): EmbeddingModel {
  return createHiknowClient().embedding(HIKNOW_EMBEDDING_MODEL);
}
