import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAI
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import scipy.stats as stats
import numpy as np
import seaborn as sns
import utils
import matplotlib
matplotlib.use('TkAgg') 

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
def run_hypothesis_analysis(df, input_features, llm):
    try:
        # Format the prompt
        prompt = code_ht_prompt_template.format(features=input_features, overview=utils.overview_data(df))

        # Get generated code
        response = llm.invoke(prompt)
        code = utils.cleanCode(response)

        # Create a full script assuming df is already defined
        with open('generated_tests.py', 'w') as f:
            f.write(f"""
# Required imports
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import numpy as np

# df is already defined before this runs

# Generated code starts here
{code}
""")

        # Execute the generated code with df in context
        exec_globals = {
            '__builtins__': __builtins__,
            'df': df,
            'pd': pd,
            'plt': plt,
            'sns': sns,
            'stats': stats,
            'np': np
        }

        with open('generated_tests.py') as f:
            exec(f.read(), exec_globals)

        # Show plots
        plt.show()
        return code, "Hypothesis tests completed successfully"

    except Exception as e:
        return None, f"Error running hypothesis tests: {e}"

# Test hypothesis
if __name__ == "__main__":
    input_features = """
    Subscription Date vs Country
    Company Type vs Country
    Email Domain vs Country
    Website Domain vs Company Type
    Phone Format vs Country
    """

    df = pd.DataFrame({
        'Subscription Date': ['2023-01-15', '2023-02-20', '2023-01-10', '2023-03-01', '2023-02-25'],
        'Country': ['USA', 'Canada', 'USA', 'UK', 'Canada'],
        'Company Type': ['Tech', 'Finance', 'Tech', 'Retail', 'Finance'],
        'Email': ['john.doe@gmail.com', 'jane.smith@yahoo.ca', 'peter.jones@company.com', 'lisa.brown@retail.co.uk', 'mark.wilson@finance.ca'],
        'Website': ['www.techco.com', 'www.financeinc.ca', 'www.techsolutions.com', 'www.retailgroup.co.uk', 'www.finance.ca'],
        'Phone Number': ['123-456-7890', '456-789-0123', '789-012-3456', '0123456789', '345-678-9012']
    })

    code, result = run_hypothesis_analysis(df, input_features, llm)
    if code:
        print("Generated Hypothesis Testing Code:")
        print(code)
        print("\nTest Execution Result:")
        print(result)
