import os
import re

import pandas as pd
from adatest import *

from peft import PeftModel  # for fine-tuning
from transformers import T5ForConditionalGeneration, T5Tokenizer, BitsAndBytesConfig, AutoModelForCausalLM
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from transformers import Pipeline
import torch


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
        inputs = self.tokenizer(prompt, return_tensors="pt", padding="max_length", truncation=True, max_length=512)
        return inputs

    def _forward(self, inputs, **kwargs):
        outputs = self.model.generate(inputs['input_ids'], attention_mask=inputs['attention_mask'], max_new_tokens=50)
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


class MistralPipeline(Pipeline):
    def __init__(self, model, tokenizer):
        super().__init__(model=model, tokenizer=tokenizer, task="text-generation")

    # def _sanitize_parameters(self, **kwargs):
    #     preprocess_kwargs = {}
    #     if "maybe_arg" in kwargs:
    #         preprocess_kwargs["maybe_arg"] = kwargs["maybe_arg"]
    #     return preprocess_kwargs, {}, {}

    def preprocess(self, prompt):
        messages = [
            {"role": "user",
             "content": "I will give you a definition of a concept, and you will write a similar sentence defining the same concept. "
                        "You must only output 1 simple sentence. "
                        f"Here is definition: \"{prompt}\""}
        ]

        encodeds = self.tokenizer.apply_chat_template(messages, return_tensors="pt")
        input_ids = encodeds.to("cuda")
        return input_ids

    def _forward(self, model_inputs, do_sample, max_length):
        outputs = self.model.generate(
            inputs=model_inputs,
            max_length=max_length + 100,
            do_sample=do_sample,
            pad_token_id=self.tokenizer.eos_token_id,
            num_return_sequences=1)
        return outputs

    def postprocess(self, model_outputs):
        decoded = self.tokenizer.decode(model_outputs[0])
        result = re.sub(r'\[INST\].*?\[/INST\]', '', decoded)
        result = re.sub(r'<s> *', '', result)
        generation = {'generated_text': result}
        return generation

    def __call__(self, essay, do_sample=True, max_length=200, num_return_sequences=0, pad_token_id=0,
                 stopping_criteria=0):
        inputs = self.preprocess(essay)
        outputs = self._forward(inputs, do_sample, max_length)
        temp = []
        temp.append(self.postprocess(outputs))
        return temp

    def _sanitize_parameters(self, **kwargs):
        kwargs["model"] = self.model
        kwargs["tokenizer"] = self.tokenizer
        kwargs["task"] = "text-generation"
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

    model_name_or_path = "mistralai/Mistral-7B-Instruct-v0.2"
    nf4_config = BitsAndBytesConfig(  # quantization 4-bit
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16
    )
    model = AutoModelForCausalLM.from_pretrained(model_name_or_path,
                                                 device_map="auto",
                                                 trust_remote_code=False,
                                                 quantization_config=nf4_config,
                                                 revision="main")

    tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, use_fast=True)

    # load in LORA fine-tune for student answer examples
    lora_model_path = "ntseng/mistralai_Mistral-7B-Instruct-v0.2-testgen-LoRAs"
    model = PeftModel.from_pretrained(
        model, lora_model_path, torch_dtype=torch.float16, force_download=True,
    )
    mistral_pipeline = MistralPipeline(model, tokenizer)
    generator = generators.Pipelines(mistral_pipeline, sep=". ", quote="")
    browser = test_tree.adapt(lce_pipeline, generator, max_suggestions=20)
    df1 = browser.test_tree._tests
    obj = AdaClass(browser)

    return obj

# obj = create_obj("PE")
# obj.generate()
# print(obj.df)