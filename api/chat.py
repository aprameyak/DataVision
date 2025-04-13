from flask import jsonify
from langchain_core.prompts import PromptTemplate
import utils
import json
import io
import app
import pandas as pd

chat_prompt_template = PromptTemplate.from_template("""

You are an expert data scientist. A user has done a little bit of data analysis on
a dataset and is now asking you for further help with their analysis. Your task is to
help the user perform the analysis they are asking for. You will be given the user's message
and you will return a JSON object containing a text string replying to the user's message and
python code that will perform the analysis they are asking for. The code should be a function 
named analyze that takes a pandas dataframe as input and returns the result of the analysis as a
string. You will be given an overview of the dataframe to help you understand what is contained in it. 

Your output should look like this:

{{
    "reply": "Your reply to the user",
    "code": "def analyze(df):\n    # Your code here\n    return result"
}}

Here is the user's message:
{user_message}

Message History:
{history}
                                                    
Here is the overview of the dataframe:
{data_overview}
                                                  
""")

def chatllm(data, llm):
    id = data.get("id")
    file_path = app.get_file_path(id)
    df = pd.read_csv(file_path)
    data_overview = utils.overview_data(df)
    user_msg = data.get("message")
    new_history = data.get("history") + [{"role": "user", "content": user_msg}]
    chat_prompt = chat_prompt_template.format(
        user_message=user_msg,
        history=new_history,
        data_overview=data_overview
    )
    llm_output = utils.cleanCode(llm.invoke(chat_prompt))
    try:
        json_output = json.loads(llm_output)
        reply = json_output['reply']
        code = json_output['code']

        local_env = {}
        exec(code, local_env)
        analyze_function = local_env.get("analyze")

        if analyze_function:
            result = analyze_function(df)
            return jsonify({
                "reply": reply,
                "code": code,
                "result": result
            })
            
    except Exception as e:
        return jsonify({"error": str(e)})