from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS, cross_origin
# from constants import api_url, api_authorization, github_token
import openai
import os
from os.path import join, dirname
from dotenv import find_dotenv, load_dotenv
import traceback
import requests
import spacy
from OpenSSL import SSL
from spacy.tokenizer import Tokenizer




load_dotenv()
SECRET_KEY = os.environ.get("api_authorization")
API_URL = os.environ.get("api_url")
# DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD")

openai.api_key = SECRET_KEY
app = Flask(__name__)

CORS(app)
openai.api_key = SECRET_KEY
generator = pipeline('text-generation', model='gpt2')


# Load the spaCy model
nlp = spacy.load("en_core_web_sm")
tokenizer = nlp.tokenizer

# Function to tokenize text using spaCy
def spacy_tokenize(text):
    return [token.text for token in tokenizer(text)]

# Function to chunk text based on a maximum token count
def chunk_text(text, max_size=1000):
    tokens = spacy_tokenize(text)
    chunks = []
    current_chunk = []
    current_size = 0
    
    for token in tokens:
        if current_size + len(token) > max_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_size = 0
        current_chunk.append(token)
        current_size += len(token)
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks

def post_process_answers(answers):
    # Combine answers into one text
    combined_answer = " ".join(answers)

    doc = nlp(combined_answer)
    # Split the combined text into sentences
    sentences = [sent.text.strip() for sent in doc.sents]

    # Remove consecutive duplicate sentences
    unique_sentences = []
    for i in range(len(sentences)):
        if i == 0 or sentences[i] != sentences[i-1]:
            unique_sentences.append(sentences[i])

    # Reconstruct the answer from unique sentences
    final_answer = ' '.join(unique_sentences)

    # Further cleaning and coherence checks can be added here
    # ...

    return final_answer


@app.route('/ask', methods=['POST'])
@cross_origin(origin='*')
def ask():
    try:
        content = request.json
        question = content['question']
        context = content['context']

        if not question or not context:
            app.logger.info("Question and/or context are missing in the request.")
            return jsonify({"error": "Question and context are required."}), 400

        # Use the chunk_text function to split the context into manageable parts
        context_chunks = chunk_text(context)

        print("Context Chunks:")
        for idx, chunk in enumerate(context_chunks):
            chunk_tokens = spacy_tokenize(chunk)
            num_tokens = len(chunk_tokens)
            print(f"Chunk {idx + 1} (Tokens: {num_tokens}):")

        # Initialize OpenAI API
        openai.api_key = SECRET_KEY
        
        # Process each chunk and gather responses
        answers = []
        for idx, chunk in enumerate(context_chunks):
            print(tokenizer(chunk))
            messages = [
                {"role": "system", "content": "You are a helpful assistant to analyze the file that is given to you. A user can give you a file that may be one of these (.js (JavaScript), .html (HTML), .css (CSS), .py (Python), .json (JSON), .md (Markdown), .java (Java), .rb (Ruby), .c (C), .cpp (C++), .sql (SQL), .php (PHP), .jsx (JavaScript JSX), .ts (TypeScript), .scss (Sass), .xml (XML), .yml (YAML), .sh (Shell script), .go (Go), .swift (Swift)) types or other types from any github repository, that is why you should provide more precise and specific answer about files according to also their types."},
                {"role": "user", "content": chunk},
                {"role": "user", "content": question}
            ]
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=2700
            )
            if response and 'choices' in response and len(response['choices']) > 0:
                answer = response['choices'][0]['message']['content'].strip()
                answers.append(answer)
                print(f"Response for Chunk {idx + 1} (Tokens: {len(spacy_tokenize(answer))}):")
                print(answer)
            else:
                app.logger.error(f"No valid response received from OpenAI for the chunk: {chunk}")
        
        # Combine answers
        final_answer = post_process_answers(answers=answers)
        print("Final Answer (Tokens: {len(spacy_tokenize(final_answer))}):")
        print(final_answer)
        return jsonify({"answer": final_answer})
    except openai.error.OpenAIError as e:
        app.logger.error(f"An OpenAIError occurred: {e}")
        return jsonify({"error": "An error occurred with the OpenAI service."}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred: {e}")
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred."}), 500


@app.route('/fetch-github-content', methods=['POST'])
@cross_origin(origin='*')
def fetch_gihhub_content():
    try:
        print(request)
        url = request.json['url']
        response = requests.get(url)
        response.raise_for_status()  # This will raise an HTTPError if the HTTP request returned an unsuccessful status code
        return jsonify(response.json())
    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"HTTP error occurred: {http_err}"}), http_err.response.status_code
    except Exception as e:
        return jsonify({"error": f"Error: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
