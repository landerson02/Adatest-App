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

    def postprocess(self, model_outputs, task=None):
        decoded = self.tokenizer.decode(model_outputs[0])
        result = re.sub(r'\[INST\].*?\[/INST\]', '', decoded)
        result = re.sub(r'<INST>.*?</INST>', '', result)
        result = result.replace('<s>', '')
        result = result.replace('</s>', '')
        result = result.replace('Do not add comments: ', '')
        result = re.sub(r'\([^)]*\)', '', result)
        result = re.sub(r'\[.+?\]', '', result)
        #####
        result = result.replace('  ', '').strip()
        if task is not None:  # only do for spanish task. this is for rmving unwanted explanation
            result = re.sub(r'\(.*', '', result).strip()
            result = re.sub(r'\[.*', '', result).strip()
            result = re.sub(r'\n.*', '',
                            result).strip()  # delete anything after a linebreak, usually an unwanted explanation
            if len(result) > 150:
                result, unwanted = result.split('.', 1)
                print("Splitting a long output:")
                print("long output split[0] = " + result)
                print("long output split[1] = " + unwanted)
        result = result.replace(' .', '.').strip()
        result = result if result.endswith('.') else result + '.'
        #####

        generation = {'generated_text': result}
        return generation

    def __call__(self, essay, do_sample=True, max_length=80, num_return_sequences=0, pad_token_id=None,
                 stopping_criteria=0):
        if self.task == "spelling":
            for i in range(len(essay) // 20):
                essay = Perturb.add_typos(essay)
            return [{'generated_text': essay}]
        # if self.task == "acronyms":
        #     essay = essay.replace("Potential energy", "PE")
        #     essay = essay.replace("potential energy", "PE")
        #     essay = essay.replace("Kinetic energy", "KE")
        #     essay = essay.replace("kinetic energy", "KE")
        #     essay = essay.replace("Law of conservation of energy", "LCE")
        #     essay = essay.replace("law of conservation of energy", "LCE")
        #     essay = essay.replace("total energy", "TE")
        #     essay = essay.replace("Total energy", "TE")
        #     return [{'generated_text': essay}]

        if self.task == "base":
            prompt = f"Use simple vocabulary. For each sentence, write a sentence about the same concept: {essay}"
            inputs = self.preprocess(prompt)
            outputs = self._forward(inputs, do_sample, max_length)
            return [self.postprocess(outputs, task=None)]
        elif self.task == "paraphrase":
            prompt = f"Rephrase the sentence in simple words. Do not add numbers or punctuation: {essay}"
        elif self.task == "synonyms":
            prompt = f"Replace only one word with a synonym in this sentence. Do not add comments: {essay}"
        elif self.task == "antonyms":
            prompt = f"Replace only one word with an antonym to make this sentence wrong. Do not add comments: {essay}"
        elif self.task == "negation":
            prompt = f"Add a 'not' to make this sentence wrong. Do not add comments: {essay}"
        elif self.task == "acronyms":
            prompt = f"Replace a common phrase in the following sentence with an acronym. Do not add comments: {essay}"
        elif self.task == "spanish":  # prompt+parse is trickier, I added an addit. postprocess
            prompt = (f"Translate some words to Spanish in this sentence. Only reply with the revised text and do not "
                      f"add comments: {essay}")
        else:
            prompt = essay

        inputs = self.preprocess(prompt)
        outputs = self._forward(inputs, do_sample, max_length)
        return [self.postprocess(outputs, task=self.task)]

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
