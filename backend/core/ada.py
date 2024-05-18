import os
import re

import pandas as pd
import torch
from adatest import *
from dotenv import load_dotenv
from transformers import (AutoModelForCausalLM,
                          AutoModelForSequenceClassification, AutoTokenizer,
                          BitsAndBytesConfig, Pipeline,
                          T5ForConditionalGeneration, T5Tokenizer)

load_dotenv()

# Check if MODEL is in .env file
if "MODEL" not in os.environ:
    raise ValueError("the env file is wrong")

MODEL_TYPE = os.getenv('MODEL')


class AdaClass:
    def __init__(self, browser):
        self.browser = browser
        self.df = browser.test_tree._tests

    def generate(self):
        self.browser.generate_suggestions()
        self.df = self.browser.test_tree._tests

    def check_col(self):
        list = []
        for row in self.df.iterrows():
            if row['topic'].contains('suggestions'):
                list.append("Unknown")
            else:
                list.append("Inputed Test")
        self.df["validity"] = list

    def compute_statistics(self):
        count = 0
        for row in self.df.iterrows():
            if row['topic'].contains('suggestions'):
                if row["Validity"] == "Approved":
                    count += 1
        return count

    def approve(self, test):
        self.df.loc[self.df['Input'] == test]["Validity"] = "Approved"


def create_obj(mistral=None, essayPipeline=None, type=None):
    csv_filename = os.path.join(os.path.dirname(__file__), f'Tests/NTX_{type}.csv')
    test_tree = TestTree(pd.read_csv(csv_filename, index_col=0, dtype=str, keep_default_na=False))

    if mistral is None:
        print("Using OPENAI")
        if "OPENAI_API_KEY" not in os.environ:
            raise ValueError("the env file is missing the OPENAI_API_KEY")

        OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

        generator = generators.OpenAI('davinci-002', api_key=OPENAI_API_KEY)
    else:
        generator = generators.Pipelines(mistral, sep=". ", quote="")

    browser = test_tree.adapt(essayPipeline, generator, max_suggestions=20)
    obj = AdaClass(browser)

    return obj
