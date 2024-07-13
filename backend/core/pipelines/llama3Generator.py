import torch
from transformers import Pipeline, AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from checklist.perturb import Perturb
import re

# returns llama3 pipeline
def load_llama3_model(model_id):
    nf4_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=nf4_config,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )

    return model, tokenizer


class LlamaGeneratorPipeline(Pipeline):
    def __init__(self, model, tokenizer, task="base"):
        super().__init__(model=model, tokenizer=tokenizer, task=task)

    def preprocess(self, prompt, system_instruct=None, assist_instruct=None):
        messages = []
        if system_instruct != None:
          messages.append({"role": "system", "content": system_instruct})
        if assist_instruct != None:
          messages.append({"role": "assistant", "content": assist_instruct})

        messages.append({"role": "user", "content": prompt})

        print(messages) #####
        encodeds = self.tokenizer.apply_chat_template(messages, return_tensors="pt")
        input_ids = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(self.model.device)

        return input_ids

    def _forward(self, model_inputs, max_new_tokens=225):
        terminators = [
            self.tokenizer.eos_token_id,
            self.tokenizer.convert_tokens_to_ids("<|eot_id|>")
        ]

        outputs = self.model.generate(
            input_ids=model_inputs,
            max_new_tokens=max_new_tokens,
            eos_token_id=terminators,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
        )
        return outputs

    def postprocess(self, outputs, input_ids):
        response = outputs[0][input_ids.shape[-1]:]
        result = self.tokenizer.decode(response, skip_special_tokens=True)
        if self.task == 'spanish' or  self.task == 'spanglish' or  self.task == 'english':
          result = re.sub(r'\([^)]*\)', '', result)
          result = re.sub(r'\[.+?\]', '', result)

        return {'generated_text': result}

    def __call__(self, essay):
        prompt_list = { # M-AIBAT criteria prompts
          'spanish': "The following sentence will either be English, Spanish, or Spanglish "\
                  + "(a combination of both). If the sentence is English, translate it "\
                  + "to Spanish. If it is Spanish, return 'not translating.' If it is "\
                  + "Spanglish, translate it fully into Spanish. Here is the sentence: ",
          'english': "The following sentence will either be English, Spanish, or Spanglish "\
                      + "(a combination of both). If the sentence is Spanish, translate it "\
                      + "to English. If it is English, return 'not translating.' If it is "\
                      + "Spanglish, translate it fully into English. Here is the sentence: ",
          'spanglish':"The following sentence will either be English, Spanish or Spanglish "\
                      + "(a combination of both).  If the sentence is English, translate it "\
                      + "to Spanglish. If it is a Spanglish combination, return 'not translating.' If it is "\
                      + "Spanish, translate it fully into Spanglish. Here is the sentence: ",
          'nouns':"The following sentence will either be English, Spanish, or Spanglish "\
                      + "(a combination of both). If the sentence is English, translate only nouns "\
                      + "in this sentence to Spanish. If it is Spanish, translate only nouns in "\
                      + "this sentence into English. If it is Spanglish, translate only nouns "\
                      + "to the other language. Here is the sentence: ",
          'cognate' : "Cognates are a pair of words in different languages with similar structure and meaning. "
                      + "If the sentence is English, find and describe a Spanish cognate. "
                      + "If the sentence is Spanish, find and describe an English cognate. "
                      + "If it is Spanglish, find a word with a cognate "
                      + "in the other language. Here is the sentence: ",
          'false_cognate':"If the sentence is English, find a false Spanish cognate. "
              + "If the sentence is Spanish, find a false English cognate. "
              + "If it is Spanglish (a combination of both languages), find a false cognate in the "
              + "other language. Here is the sentence: ",
          'colloquial':"The following sentence will either be English, Spanish, or Spanglish "
              + "(a combination of both). If the sentence is English, add a coloquial Spanish word. "
              + "If the sentence is Spanish, add an English coloquial word. "
              + "If it is Spanglish, add a colloquial word from the other language. Here is the sentence: ",
          'loan_word':"If the sentence is English, replace a noun or a verb "
              + "in this sentence with a loanword in Spanish. If the sentence is Spanish, replace "
              + "a noun or a verb in this sentence with a loanword in English.  If it is Spanglish (a combination of both English and Spanish), "
              + "replace only nouns or verbs to the other language. Here is the sentence: ",
          'word_wall':"Identify the theme in this sentence that can produce a word wall:",
          'sentence_building': "Build on this sentence with increasing grammatical complexity: ",
        }

        system_instr = None
        assist_instr = None

        # M-AIBAT Criteria
        if self.task == "base":
            prompt = f"Rephrase each sentence: {essay}"
            system_instr = "Do not explain your steps. Only reply with the new sentences."
        elif self.task in prompt_list:
          prompt = prompt_list[self.task] + f"{essay}"
          system_instr = "Only reply with the new sentence. Do not explain."
          if self.task == "cognate":
            system_instr = "Do not explain your steps. Give your answer and the word's meaning."
          elif self.task == "false_cognate":
            system_instr = "Do not explain your steps. Give your answer and the word's meaning."
            assist_instr = "False cognates are pairs of words in different languages "\
              + "that seem to be cognates because of similar sounds, but have different meanings."

        # AIBAT Criteria
        elif self.task == "spelling":
          for i in range(len(essay) // 20):
            essay = Perturb.add_typos(essay)
          return [{'generated_text': essay}]
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
        else:
            prompt = essay

        input_ids = self.preprocess(prompt=prompt, system_instruct=system_instr, assist_instruct=assist_instr)
        outputs = self._forward(input_ids)
        generated_text = self.postprocess(outputs, input_ids)
        return generated_text

    def _sanitize_parameters(self, **kwargs):
        kwargs['model'] = self.model
        kwargs['tokenizer'] = self.tokenizer
        kwargs['task'] = self.task
        if "task" in kwargs:
            return kwargs
        else:
            raise ValueError(f"Please provide task")