from transformers import (Pipeline, T5ForConditionalGeneration, T5Tokenizer)


def load_flant5_model(model_name):
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model.eval()
    return model, tokenizer


class CustomEssayPipeline(Pipeline):
    def __init__(self, model, tokenizer, task="essay-classification"):
        super().__init__(model, tokenizer, task)

    def preprocess(self, essay):
        prompt = f"According to the following essay, classify the student's definition of LCE as {{option_1: acceptable}}, {{option_2: unacceptable}}\n{essay}"
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
