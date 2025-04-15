from flask import Flask, jsonify, request
from langchain_google_genai import GoogleGenerativeAI
import os
from dotenv import load_dotenv
import clean
import design
import hypothesis
import summarize
import utils
import chat
import pandas as pd
import uuid
import atexit

app = Flask(__name__)

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

llm = GoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=api_key,
    temperature=0.7,
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_file_path(id):
    return os.path.join(UPLOAD_FOLDER, f"{id}.csv")

uploaded_files = set()

def cleanup_files():
    for file_path in uploaded_files:
        if os.path.exists(file_path):
            os.remove(file_path)

atexit.register(cleanup_files)

@app.route('/api/delete_file', methods=['POST'])
def delete_file():
    id = request.json.get('id')
    file_path = get_file_path(id)
    if os.path.exists(file_path):
        os.remove(file_path)
        uploaded_files.discard(file_path)
        return jsonify({"message": "File deleted successfully"}), 200
    return jsonify({"error": "File not found"}), 404



@app.route('/api/test')
def test():
    return "Hello, World!"

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part in the request", 400

    file = request.files['file']

    if file.filename == '':
        return "No selected file", 400

    try:
        id = str(uuid.uuid4())
        filepath = get_file_path(id)
        file.save(filepath)
        return jsonify({"id": id})
    except Exception as e:
        return f"An error occurred while saving the file: {str(e)}", 500

@app.route('/api/data_cleaning', methods=['POST'])
def clean_data():
    id = request.json.get('id')
    try:
        df = pd.read_csv(get_file_path(id))
        file_path = get_file_path(id)
        cleaning_result = clean.data_clean(df, llm, file_path)
        
        # Handle if cleaning_result contains Response objects
        if hasattr(cleaning_result, 'get_json'):
            cleaning_result = cleaning_result.get_json()
        
        # Custom JSON encoder with proper NaN handling
        import json
        import numpy as np
        
        # First convert all NaN values in the cleaned_df to None
        if 'cleaned_df' in cleaning_result and cleaning_result['cleaned_df']:
            for record in cleaning_result['cleaned_df']:
                for key, value in record.items():
                    if isinstance(value, float) and np.isnan(value):
                        record[key] = None
        
        # Use custom encoder for remaining NaN values that might be in other parts
        class NpEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                if isinstance(obj, np.floating):
                    return None if np.isnan(obj) else float(obj)
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                if isinstance(obj, np.bool_):
                    return bool(obj)
                if pd.isna(obj):
                    return None
                try:
                    return super(NpEncoder, self).default(obj)
                except:
                    return str(obj)
        
        # Use dumps with custom encoder then jsonify the result
        return app.response_class(
            response=json.dumps(cleaning_result, cls=NpEncoder),
            status=200,
            mimetype='application/json'
        )
    
    except Exception as e:
        import traceback
        app.logger.warning(f"Error in data_cleaning: {str(e)}")
        print(traceback.format_exc())  # Print full traceback for debugging
        return jsonify({"error": str(e)}), 500

@app.route('/api/design_procedure', methods=['POST'])
def design_procedure():
    id = request.json.get('id')
    
    try:
        df = pd.read_csv(get_file_path(id))
        procedure = design.design_procedure(df)
        return procedure
    except Exception as e:
        return f"An error occurred while processing the file: {str(e)}", 500

@app.route("/api/hypothesis_test", methods=['POST'])
def hypothesis_test():
    id = request.json.get('id')

    try:
        df = pd.read_csv(get_file_path(id))
        procedure = request.json.get('designResult')
    except Exception as e:
        return f"An error occurred while processing the file: {str(e)}", 500
    return jsonify(hypothesis.hypothesis_testing(df, llm, procedure))

@app.route("/api/summarize", methods=['POST'])
def summarize_analysis():
    data = request.get_json()
    cleaning_summary = data.get('cleaning_summary')
    potential_relationships = data.get('potential_relationships')
    p_values_summary = data.get('p_values_summary')
    return jsonify(summarize.summarize(cleaning_summary, potential_relationships, p_values_summary, llm))


@app.route("/api/chat", methods=['POST'])
def llm_chat():
    data = request.get_json()
    return chat.chatllm(data, llm)

if __name__ == '__main__':
    app.run(debug=True, port=5000)