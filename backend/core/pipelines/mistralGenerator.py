from transformers import (AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, Pipeline)
from checklist.perturb import Perturb
import re
import torch


def load_mistral_model():
    model_name_or_path = "mistralai/Mistral-7B-Instruct-v0.2"
    print("Loading " + model_name_or_path + " from hugging face")
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
    return model, tokenizer


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
        generation = {'generated_text': result}
        return generation

    # NORA: changed max_len, maybe change max_length dependentg on the input essay...
    def __call__(self, essay, do_sample=True, max_length=80, num_return_sequences=0, pad_token_id=None,
                 stopping_criteria=0):
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
            essay = essay.replace("total energy", "TE")
            essay = essay.replace("Total energy", "TE")
            return [{'generated_text': essay}]

        if (self.task == "base"):
            prompt = f"Use simple vocabulary. For each sentence, write a sentence about the same concept: {essay}"
        elif (self.task == "paraphrase"):
            prompt = f"Rephrase the sentence in simple words. Do not add numbers or punctuation: {essay}"
        elif (self.task == "synonyms"):
            prompt = f"Replace a word with a synonym in this sentence. Do not explain the answer: {essay}"
        elif (self.task == "antonyms"):
            prompt = f"Replace a word with an antonym in this sentence. Do not explain the answer: {essay}"
        elif (self.task == "negation"):
            prompt = f"Negate this sentence. Do not explain the answer: {essay}"
        elif (self.task == "spanish"):
            prompt = f"Translate a couple words to spanish in this sentence. Do not explain the answer: {essay}"
        else:
            prompt = essay

        inputs = self.preprocess(prompt)
        outputs = self._forward(inputs, do_sample, max_length)
        temp = []
        temp.append(self.postprocess(outputs))
        return temp

    def _sanitize_parameters(self, **kwargs):
        kwargs["model"] = self.model
        kwargs["tokenizer"] = self.tokenizer
        kwargs["task"] = self.task
        valid_tasks = ["base", "spelling", "paraphrase", "acronyms", "synonyms", "antonyms", "negation", "spanish",
                       "custom"]
        if "task" in kwargs:
            if kwargs["task"] not in valid_tasks:
                raise ValueError(f"Invalid capability. Supported tasks are: {valid_tasks}")
        else:
            raise ValueError(f"Please provide capability")
        return kwargs