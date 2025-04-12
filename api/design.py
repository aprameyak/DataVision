import os
import json
import pandas as pd
from dotenv import load_dotenv
from typing_extensions import TypedDict, Annotated

from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END

from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

df = pd.read_csv("customers-100.csv")

class AgentState(TypedDict):
    messages: Annotated[list[dict], add_messages]

@tool
def get_value_counts(input_str: str) -> str:
    """Return value counts for a specific column. 
    Input must be an exact column name from the dataframe.
    Always use this tool first when analyzing column distributions."""
    column = input_str.strip()
    if column in df.columns:
        return str(df[column].value_counts())
    return f"Column '{column}' not found. Available columns: {list(df.columns)}"

@tool
def filter_by_condition(input_str: str) -> str:
    """Filter dataframe rows based on a condition. 
    Requires JSON input with 'column' and 'condition' keys.
    Example input: '{"column": "age", "condition": "> 30"}'"""
    try:
        args = json.loads(input_str)
        filtered = df.query(f"{args['column']} {args['condition']}")
        return str(filtered.head(5))
    except Exception as e:
        return f"Error: {str(e)}. Required format: {{'column': 'col_name', 'condition': 'operator value'}}"

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=api_key,
    temperature=0,
)

llm_with_tools = llm.bind_tools(
    [get_value_counts, filter_by_condition],
)

def agent_node(state: AgentState):
    messages = state["messages"]
    # for msg in messages:
    #     print(f"{type(msg).__name__}: {msg.content}")
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

tool_node = ToolNode(
    [get_value_counts, filter_by_condition],
    handle_tool_errors=True 
)

def should_continue(state: AgentState):
    last_msg = state["messages"][-1]
    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
        # print("\n🔧 Detected Tool Calls:")
        # for call in last_msg.tool_calls:
        #     print(f"- {call['name']} with args: {call.get('args', {})}")
        return "tools"
    return END

workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")
chain = workflow.compile()

design_procedure_prompt = PromptTemplate.from_template("""
You are an expert data scientist. Your task is to find interesting insights about data
in a pandas dataframe. You will be provided with an overview of the dataframe and you
will make a list of potentially interesting relationships to explore in the data as well as
the relevant hypothesis tests to conduct. Output only a paragraph talking about the potentially interesting
relationships that should be explored and the relevant hypothesis tests to conduct, do not include any
additional text or explanation.

Here is the overview of the dataframe:
{data_overview}
""")

# Enhanced entrypoint function
def design_procedure(df: pd.DataFrame):
    data_overview = f"Columns: {list(df.columns)}\nSample:\n{df.head(2).to_string()}"
    initial_prompt = design_procedure_prompt.format(data_overview=data_overview)
        
    try:
        result = chain.invoke({
            "messages": [HumanMessage(content=initial_prompt)]
        })
        
        final_message = result["messages"][-1]
        if hasattr(final_message, 'content'):
            return final_message.content
        return "Analysis completed with tool calls. Check debug output for details."
    
    except Exception as e:
        return f"Analysis failed: {str(e)}"

# Main execution with debug output
if __name__ == "__main__":
    result = design_procedure(df)
    print(result)
