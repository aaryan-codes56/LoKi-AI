# backend/services/embedder.py: Provides a utility to obtain OpenAI embeddings (text-embedding-ada-002) for the document chunks.

from langchain_openai import OpenAIEmbeddings

def get_embeddings_model() -> OpenAIEmbeddings:
    """
    Initializes and returns the OpenAIEmbeddings model using text-embedding-ada-002.
    """
    # Instantiate OpenAIEmbeddings using the required text-embedding-ada-002 model name.
    # It will automatically pick up the OPENAI_API_KEY environment variable.
    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
    return embeddings
