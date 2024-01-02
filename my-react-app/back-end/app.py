from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS, cross_origin
from constants import api_url, api_authorization, github_token
import openai
import os
from os.path import join, dirname
from dotenv import find_dotenv, load_dotenv

load_dotenv()
SECRET_KEY = os.environ.get("api_authorization")
# DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD")

openai.api_key = SECRET_KEY
app = Flask(__name__)

CORS(app)
openai.api_key = SECRET_KEY
generator = pipeline('text-generation', model='gpt2')


import requests

API_URL = api_url

@app.route('/ask', methods=['POST'])
@cross_origin(origin='*')
def ask():
    try:
        content = request.json
        question = content['question']
        context = content.get('context')  # This gets the context, if it exists

        # Ensure that both question and context are provided
        if not question or not context:
            return jsonify({"error": "Question and context are required."}), 400

        # Construct the messages to send to the LLM
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": context},
            {"role": "user", "content": question}
        ]

        print(context)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150
        )

        answer = response['choices'][0]['message']['content'].strip()
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        traceback.print_exc()  # This will print the stack trace to stdout
        return jsonify({"error": str(e)}), 500

import requests

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
