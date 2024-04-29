from dotenv import load_dotenv
import os
import re

import pandas as pd
from adatest import *

from transformers import T5ForConditionalGeneration, T5Tokenizer, BitsAndBytesConfig, AutoModelForCausalLM
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from transformers import Pipeline
import torch

load_dotenv()

# Check if MODEL is in .env file
if "MODEL" not in os.environ:
    raise ValueError("the env file is wrong")

MODEL_TYPE = os.getenv('MODEL')

# if MODEL_TYPE == "mistral":
    # from peft import PeftModel  # for fine-tuning

def load_model(model_name):
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model.eval()
    return model, tokenizer


class CustomEssayPipeline(Pipeline):
    @staticmethod
    def load_model(model_name):
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model.eval()
        return model, tokenizer

    def __init__(self, model, tokenizer, task="essay-classification"):
        super().__init__(model, tokenizer, task)

    def preprocess(self, essay):
        prompt = f"According to the following essay, classify the student's definition of LCE as {{option_1: Acceptable}}, {{option_2: Unacceptable}}\n{essay}"
        inputs = self.tokenizer(prompt, return_tensors="pt", padding="max_length", truncation=True, max_length=300)
        return inputs

    def _forward(self, inputs, **kwargs):
        outputs = self.model.generate(inputs['input_ids'], attention_mask=inputs['attention_mask'], max_new_tokens=40)
        return outputs

    def postprocess(self, model_outputs):
        prediction = self.tokenizer.decode(model_outputs[0], skip_special_tokens=True)
        return prediction

    def __call__(self, essay):
        if isinstance(essay, str):
            inputs = self.preprocess(essay)
            outputs = self._forward(inputs)
            temp = []
            temp.append(self.postprocess(outputs))
            return temp
        else:
            temp = []
            for ess in essay:
                inputs = self.preprocess(ess)
                outputs = self._forward(inputs)
                temp.append(self.postprocess(outputs))
            return temp

    def _sanitize_parameters(self, **kwargs):
        # Validate and set default values for parameters
        valid_tasks = ["essay-classification", "other-task"]
        if "task" in kwargs:
            if kwargs["task"] not in valid_tasks:
                raise ValueError(f"Invalid task. Supported tasks are: {valid_tasks}")
        else:
            kwargs["task"] = "essay-classification"

        # Add more parameter validation and default values if needed
        valid_models = ["aanandan/FlanT5_AdaTest_LCE_v2", "aanandan/FlanT5_AdaTest_PE_v2",
                        "aanandan/FlanT5_AdaTest_KE_v2"]
        if "model" in kwargs:
            if kwargs["model"] not in valid_models:
                raise ValueError(f"Invalid model. Supported models are: {valid_models}")
        else:
            kwargs["model"], kwargs["tokenizer"] = self.model, self.tokenizer

        return kwargs


import checklist
from checklist.editor import Editor
from checklist.perturb import Perturb

class MistralPipeline(Pipeline):
    def __init__(self, model, tokenizer, task="base"):
      super().__init__(model=model, tokenizer=tokenizer, task=task)

    def preprocess(self, prompt):
      messages = [
        {"role": "user", "content": prompt}
      ]

      encodeds = self.tokenizer.apply_chat_template(messages, return_tensors="pt")
      input_ids = encodeds.to("cuda")
      return input_ids

    def _forward(self, model_inputs, do_sample, max_length):
        outputs = self.model.generate(
            inputs=model_inputs,
            max_length=max_length + 50,
            do_sample=do_sample,
            pad_token_id=self.tokenizer.eos_token_id,
            num_return_sequences=1
            )
        return outputs

    def postprocess(self, model_outputs):
        decoded = self.tokenizer.decode(model_outputs[0])
        result = re.sub(r'\[INST\].*?\[/INST\]', '', decoded)
        result = re.sub(r'<INST>.*?</INST>', '', result)
        # result = re.sub(r'<s>', '', result)
        # result = re.sub(r'</s>', '', result)
        result = result.replace('<s>', '')
        result = result.replace('</s>', '')
        result = re.sub(r'\([^)]*\)', '', result)

        result = result.replace('\n', '')
        result = result.replace('  ', '')
        generation = {'generated_text' : result}
        return generation

    ## NORA: changed max_len, maybe change max_length dependentg on the input essay...
    def __call__(self, essay, do_sample=True, max_length=80, num_return_sequences=0, pad_token_id=None, stopping_criteria=0):
        if (self.task == "spelling"):
            for i in range(len(essay) // 20):
                essay = Perturb.add_typos(essay)
            return [{'generated_text': essay}]
        if (self.task == "acronyms"):
            essay = essay.replace("Potential energy", "PE")
            essay = essay.replace("potential energy", "PE")
            essay = essay.replace("Kinetic energy", "KE")
            essay = essay.replace("kinetic energy", "KE")
            essay = essay.replace("Law of conservation of energy", "LCE")
            essay = essay.replace("law of conservation of energy", "LCE")
            return [{'generated_text': essay}]

        if (self.task == "base"):
            prompt = f"Use simple vocabulary. For each sentence, write a sentence about the same concept: {essay}"
        # elif (self.task == "spelling"):
        #     prompt = f"Add typos to the following sentences. Here are the sentences: {essay}"
        elif (self.task == "paraphrase"):
            prompt = f"Rephrase the sentence in simple words. Do not add numbers or punctuation: {essay}"
        # elif (self.task == "acronyms"):
        #     prompt = f"Add acronyns to each of the following sentences. Here are the sentences: {essay}"
        elif (self.task == "synonyms"):
            prompt = f"Replace a word with a synonym in this sentence. Do not explain the answer: {essay}"
        elif (self.task == "antonyms"):
            prompt = f"Replace a word with an antonym in this sentence. Do not explain the answer: {essay}"
        elif (self.task == "negation"):
            prompt = f"Negate this sentence. Do not explain the answer: {essay}"
        else:
            prompt = f"Translate a couple words to spanish in this sentence. Do not explain the answer: {essay}"

        inputs = self.preprocess(prompt)
        outputs = self._forward(inputs, do_sample, max_length)
        temp = []
        temp.append(self.postprocess(outputs))
        return temp

    def _sanitize_parameters(self, **kwargs):
        kwargs["model"] = self.model
        kwargs["tokenizer"] = self.tokenizer
        kwargs["task"] = self.task
        valid_tasks = ["base","spelling","paraphrase","acronyms","synonyms","antonyms","negation","spanish"]
        if "task" in kwargs:
          if kwargs["task"] not in valid_tasks:
            raise ValueError(f"Invalid capability. Supported tasks are: {valid_tasks}")
        else:
          raise ValueError(f"Please provide capability")
        return kwargs


class AdaClass():
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
    df1 = browser.test_tree._tests
    obj = AdaClass(browser)

    return obj

#obj = create_obj(type = "PE")
#obj.generate()
#print(obj.df.iloc)

 
