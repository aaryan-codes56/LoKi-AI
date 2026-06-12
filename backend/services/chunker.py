# backend/services/chunker.py: Splits uploaded document text or PDF content into smaller chunks for embedding and vector storage.

import io
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from the bytes of a PDF file using pypdf.
    """
    # Wrap bytes in a file-like object for PdfReader
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def split_document(text: str, filename: str) -> List[Document]:
    """
    Splits the raw text from a document into LangChain Document objects with metadata.
    Uses chunk size 500 and overlap 50.
    """
    # Create the text splitter configured with the specified chunk size and overlap
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    
    # Split the raw text into individual string chunks
    chunks = splitter.split_text(text)
    
    # Wrap each chunk in a LangChain Document object with metadata including source filename
    documents = [
        Document(page_content=chunk, metadata={"source": filename, "chunk_index": i})
        for i, chunk in enumerate(chunks)
    ]
    
    return documents
