import transformers
import torch

model_id = "meta-llama/Meta-Llama-3-8B"

pipeline = transformers.pipeline("text-generation", model=model_id, model_kwargs={"torch_dtype": torch.bfloat16},
                                 device_map="auto")
print(pipeline("Hey how are you doing today?"))


# class GeneralGrader:
#     def __init__(self, model_id):
#         model_id = "meta-llama/Meta-Llama-3-8B"
#         self.pipeline = transformers.pipeline("text-generation", model=model_id,
#                                               model_kwargs={"torch_dtype": torch.bfloat16}, device_map="auto")
#
#     def __call__(self, prompt):
#         return self.pipeline(prompt)[0]["generated_text"]
