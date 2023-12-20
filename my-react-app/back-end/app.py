from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
generator = pipeline('text-generation', model='gpt2')

@app.route('/ask', methods=['POST'])
def ask():
    content = request.json
    question = content['question']
    response = generator(question, max_length=50, num_return_sequences=1)
    return jsonify(response[0]['generated_text'])

if __name__ == '__main__':
    app.run(debug=True)



import requests

API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}

@app.route('/ask', methods=['POST'])
def ask():
    content = request.json
    payload = {"inputs": content['question']}
    response = requests.post(API_URL, headers=headers, json=payload)
    return jsonify(response.json()[0]['generated_text'])
