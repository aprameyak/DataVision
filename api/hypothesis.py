import os
import ast
import base64
from io import BytesIO
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('TkAgg', force=True)
import matplotlib.pyplot as plt
import seaborn as sns
import scipy.stats as stats
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import utils


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

llm = GoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=api_key,
    temperature=0.7,
)

code_ht_prompt_template = PromptTemplate.from_template("""

    You are an expert data scientist. Your task is to generate python code for hypothesis 
    testing for relationships between certain features in a dataframe. The code should run the test,
    calculating the p value, test statistic, and display the results in an appropriate graph. You 
    will be provided with the following things: 
        1. a list of features with which hypothesis tests to conduct for each features
        2. an overview of the dataframe you are working with
    
    Your output should be a python function that performs this hypothesis testing and visualization.
    You should use matplotlib, scipy, pandas, and seaborn for this.
    Return only the code and no additional text. 
    
    Here is the list of features: 
    {features}
    
    Here is an overview of the dataframe:
    {overview}
""")

def run_hypothesis_pipeline(df, input_features, llm):
    def plot_to_base64():
        buf = BytesIO()
        plt.savefig(buf, format="png", dpi=300, bbox_inches='tight')
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    def get_llm_response(prompt):
        response = llm.invoke(prompt)
        return utils.cleanCode(
            response if isinstance(response, str)
            else getattr(response, "content", "") or response.get("content", "")
        )

    code_prompt_template = PromptTemplate.from_template("""
    Generate Python code for hypothesis testing between features in a dataframe that:
    1. Performs ALL specified tests in the analysis descriptions
    2. Creates high-quality visualizations for ALL relationships
    3. Shows test statistics on plots
    4. Handles different data types appropriately
    5. Returns a list of base64 encoded strings for each plot generated

    IMPORTANT: Instead of using plt.show(), append each plot to a list as a base64 encoded string.

    Analysis descriptions:
    {features}

    Dataframe overview:
    {overview}

    Return ONLY executable code that includes a function to perform all tests and return the list of plot images.
    """)

    initial_prompt = code_prompt_template.format(
        features=input_features,
        overview=utils.overview_data(df)
    )

    code_candidate = get_llm_response(initial_prompt)

    try:
        ast.parse(code_candidate)
    except SyntaxError as syn_err:
        raise ValueError(f"Syntax error in generated code: {syn_err}\n\nCode:\n{code_candidate}")

    exec_globals = {
        '__builtins__': __builtins__,
        'df': df,
        'pd': pd,
        'plt': plt,
        'sns': sns,
        'stats': stats,
        'np': np,
        'base64': base64,
        'BytesIO': BytesIO,
        'plot_to_base64': plot_to_base64
    }

    plot_images = []
    try:
        exec(code_candidate, exec_globals)
        plot_images = exec_globals.get('plot_images', [])
    except Exception as e:
        print(f"Error in execution: {e}")
        
    return plot_images

