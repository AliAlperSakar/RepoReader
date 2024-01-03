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

def chunk_text(text, max_words_per_chunk):
    # Use spaCy's pipeline for splitting the text into sentences
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]

    # Initialize variables
    chunks = []
    current_chunk = ""

    # Build chunks by combining sentences
    for sentence in sentences:
        if len(current_chunk) + len(sentence) > max_words_per_chunk and current_chunk:
            chunks.append(current_chunk)
            current_chunk = sentence
        else:
            current_chunk += (' ' + sentence)
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks

def post_process_answers(answers):
    # Combine answers into one text
    combined_answer = " ".join(answers)

    # Split the combined text into sentences
    sentences = combined_answer.split('. ')

    # Remove duplicate sentences
    seen = set()
    unique_sentences = []
    for sentence in sentences:
        if sentence not in seen:
            seen.add(sentence)
            unique_sentences.append(sentence)

    # Reconstruct the answer from unique sentences
    final_answer = '. '.join(unique_sentences)

    # Further cleaning and coherence checks can be added here
    # ...

    return final_answer

@app.route('/ask', methods=['POST'])
@cross_origin(origin='*')
def ask():
    try:
        content = request.json
        question = content['question']
        context = content.get('context')  # This gets the context, if it exists

        if not question or not context:
            return jsonify({"error": "Question and context are required."}), 400

        # Split the context into chunks using your chunking function
        context_chunks = chunk_text(context, max_words_per_chunk=2700)

        # Send each chunk to the LLM and collect the responses
        answers = []
        for chunk in context_chunks:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": chunk},
                {"role": "user", "content": question}
            ]
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=2700
            )
            answers.append(response['choices'][0]['message']['content'].strip())

        # Post-process the answers to remove any repetition and ensure coherence
        final_answer = post_process_answers(answers)

        return jsonify({"answer": final_answer})
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

@app.route('/fetch-github-content', methods=['POST'])
@cross_origin(origin='*')
def fetch_github_content():
    try:
        url = request.json['url']
        response = requests.get(url)
        response.raise_for_status()  # This will raise an HTTPError if the HTTP request returned an unsuccessful status code
        return jsonify(response.json())
    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"HTTP error occurred: {http_err}"}), http_err.response.status_code
    except Exception as e:
        return jsonify({"error": f"Error: {e}"}), 500


# Function to query LLM with context from GitHub
def query_llm_with_context(question, context):
    # Prepare the payload for the LLM API call
    payload = {
        'question': question,
        'context': context
    }
    # Call the LLM API
    response = requests.post('LLM_API_ENDPOINT', json=payload)
    if response.status_code == 200:
        return response.json()['answer']
    else:
        raise Exception(f"LLM API request failed with status code {response.status_code}")

# Example usage
selected_item = {
    "name": "api",
    "path": "api",
    "url": "https://api.github.com/repos/jmorganca/ollama/contents/api",
    # Other details...
}

try:
    # Fetch the contents of the directory or file
    content = fetch_github_content(selected_item['url'])
    
    # Let's assume 'question' is obtained from the frontend
    question = "What is the purpose of the 'api' directory?"
    
    # Query the LLM with the content of the directory as context
    answer = query_llm_with_context(question, content)
    
    # Send the answer back to the frontend
    print(answer)
except Exception as e:
    print(e)


if __name__ == '__main__':
    app.run(debug=False)
