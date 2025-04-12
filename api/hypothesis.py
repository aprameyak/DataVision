import os
import ast
import base64
from io import BytesIO
import numpy as np
import pandas as pd
from langchain_google_genai import GoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import utils



hypothesis_testing_prompt_template = PromptTemplate.from_template("""
    You are an expert data scientist. Your task is to write a function that conducts a series of
    hypothesis tests on a dataframe, examining the relationships between different columns in the
    dataframe.
   
    You will be provided with the following items:
    1. A set of instructions containing which hypothesis tests to run and the columns to use.
    2. An overview of the structure of the dataframe that will be inputted to your function.
   
    Write a function called hypothesis_test that takes in a pandas dataframe and performs the specified
    hypothesis tests using scipy. You can assume that the dataframe will always have the properties detailed in the
    dataframe overview you receive.
   
    IMPORTANT: For every hypothesis test you perform, create exactly one visualization. For each test where
    assumptions aren't met, still create a figure but note the issue visually and return None as the p-value.
    The function must return exactly the same number of figures as p-values.
    
    Have the function return a tuple containing:
    1. A list of all the figures created (do not show the figures in the function).
    2. A list of p-values corresponding to the hypothesis tests performed. Use None for skipped tests. These should be
       strings that say what the test is, what the variables are, and the p-value, e.g. "t-test: var1 vs var2, p-value: 0.05".
   
    Only use the following libraries:
    - pandas
    - matplotlib
    - seaborn
    - scipy.stats
    - numpy
   
   DO NOT USE ANY OTHER LIBRARIES.
                                                                  
    Respond with only the code and no additional text or explanation.
    Here are the instructions:
    {instructions}
   
    Here is the overview of the dataframe:
    {data_overview}
""")
def hypothesis_testing(df, llm, instructions):
    data_overview = utils.overview_data(df)
    hypothesis_testing_prompt = hypothesis_testing_prompt_template.format(
        data_overview=data_overview, 
        instructions=instructions
    )
    code = utils.cleanCode(llm.invoke(hypothesis_testing_prompt))
    print("CODE: ", code)
    
    try:
        local_env = {}
        exec(code, local_env)
        hypothesis_test = local_env.get("hypothesis_test")
        
        if not hypothesis_test:
            return {"status": "error", "message": "Hypothesis test function not found"}
            
        figures, p_values = hypothesis_test(df)
        
        if len(figures) != len(p_values):
            return {"status": "error", "message": f"Count mismatch: {len(figures)} figures vs {len(p_values)} p-values"}
        
        base64_figures = [utils.convert_plt_to_base64(fig) for fig in figures]
        
        # Format p-values (keep None values as is)
        p_values = [p if p is None else str(p) for p in p_values]        
        return {
            "status": "success",
            "figures": base64_figures,
            "p_values": p_values
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}