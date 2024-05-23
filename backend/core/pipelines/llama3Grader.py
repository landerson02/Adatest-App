import torch
from transformers import Pipeline
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig


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


class GeneralGraderPipeline(Pipeline):
    def __init__(self, model, tokenizer, task):
        super().__init__(model=model, tokenizer=tokenizer, task=task)

    def preprocess(self, concept, essay): # continue tweaking prompt
        prompt = f"Is this sentence an acceptable or unacceptable definition of {concept}? Here is the example: {essay}"

        messages = [
            {"role": "system", "content": "Always only answer with acceptable or unacceptable."},
            {"role": "user", "content": prompt}
        ]

        input_ids = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(self.model.device)

        return input_ids

    def _forward(self, model_inputs):
        terminators = [
            self.tokenizer.eos_token_id,
            self.tokenizer.convert_tokens_to_ids("<|eot_id|>")
        ]

        outputs = self.model.generate(
            input_ids=model_inputs,
            max_new_tokens=256,
            eos_token_id=terminators,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
        )
        return outputs

    def postprocess(self, outputs, input_ids):
        response = outputs[0][input_ids.shape[-1]:]
        prediction = self.tokenizer.decode(response, skip_special_tokens=True)
        return prediction

    def __call__(self, essay):
        input_ids = self.preprocess(self.task, essay)
        outputs = self._forward(input_ids)
        generated_text = self.postprocess(outputs, input_ids)
        return generated_text

    def _sanitize_parameters(self, **kwargs):
        kwargs['model'] = self.model
        kwargs['tokenizer'] = self.tokenizer
        kwargs['task'] = self.task

        return kwargs
