import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI
import utils
import pandas as pd
import numpy as np
from flask import jsonify
import json
import io

summarize_prompt_template = PromptTemplate.from_template("""
You are an expert data scientist. Your task is to observe an overview of what is contained
in a pandas dataframe and then perform data cleaning on it if it is needed. Observe this overview 
of the dataframe and determine if it needs any cleaning. If it does not, reply with exactly 
NO CLEANING NECESSARY with no additional spacing or text. If it does require cleaning, you 
will need to output a JSON object containing a text string summary of the cleaning you are 
performing and a a python function called clean_dataframe that takes the dataframe as input 
and returns the cleaned dataframe. 

Here is an example of what the JSON object should look like:
                                                          
{{
    "summary": "Removed duplicates and filled missing values",
    "clean_dataframe": "def clean_dataframe(df):\n    df = df.drop_duplicates()\n    df = df.fillna(0)\n    return df"
}}

Respond with only the JSON object and no additional 
text or explanation.

Here is the overview of the dataframe:
{data_overview}
""")

summarize_prompt_template = PromptTemplate.from_template("""
A person gave an expert data scientist a csv and the data scientist cleaned it, hypothesized some potentially
interesting relationships between the data, and ran some tests on the data. Your job is to summarize the results
of what the data scientist did and what they found in a digestible paragraph.

You will be provided with the following items:
- A summary of the cleaning that the data scientist did
- The potential relationships the data scientist decided to explore
- The p-values of the tests that the data scientist ran

Respond with only the summary paragraph and no additional text or explanation.

Here is the summary of the cleaning:
{cleaning_summary}

Here are the potential relationships the scientist decided to explore:
{potential_relationships}

Here are the p-values of the tests that the scientist ran:
{p_values_summary}

""")

def summarize(cleaning_summary, potential_relationships, p_values_summary, llm):
    summarize_prompt = summarize_prompt_template.format(cleaning_summary=cleaning_summary, potential_relationships=potential_relationships, p_values_summary=p_values_summary)
    llm_output = utils.cleanCode(llm.invoke(summarize_prompt))
    return llm_output