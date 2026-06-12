# backend/services/llm.py: Sends the constructed context prompt and user query to OpenAI's GPT-3.5-turbo via LangChain.

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# Define the exact prompt template required by the user instructions.
RAG_PROMPT_TEMPLATE = """You are a helpful assistant. Answer the question based ONLY 
on the following context. If the answer is not in the context, 
say "I don't know based on your documents."

Context: {context}
Question: {question}
Answer:"""

def call_llm(context: str, question: str) -> str:
    """
    Constructs the prompt using the context and question, and gets the answer from GPT-3.5-turbo.
    """
    # Create the ChatOpenAI client wrapper pointing to gpt-3.5-turbo with 0 temperature for reproducibility
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.0)
    
    # Define the template format structure using LangChain's PromptTemplate helper
    prompt = PromptTemplate(
        template=RAG_PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )
    
    # Format the prompt with the input values
    formatted_prompt = prompt.format(context=context, question=question)
    
    # Call the LLM with the final formatted string input
    response = llm.invoke(formatted_prompt)
    
    # Extract and return the text content from the ChatMessage response object
    return response.content
