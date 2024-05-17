import json
import os
import sqlite3
import uuid

from django_nextjs.render import render_nextjs_page_sync
from dotenv import load_dotenv
from peft import PeftModel  # for fine-tuning
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from ..ada import *
from ..models import *
from ..pipelines.flanT5Grader import *
from ..pipelines.robertaGrader import *
from ..pipelines.mistralGenerator import *
from ..serializer import PerturbationSerializer, ReactSerializer, TestSerializer

load_dotenv()
# Check if MODEL is in .env file
if "MODEL" not in os.environ:
    raise ValueError("the env file is wrong")

MODEL_TYPE = os.getenv('MODEL')

# helper objects

lce_model, lce_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_LCE_v2')
lce_pipeline = CustomEssayPipeline(model=lce_model, tokenizer=lce_tokenizer)

pe_model, pe_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_PE_v2')
pe_pipeline = CustomEssayPipeline(model=pe_model, tokenizer=pe_tokenizer)

ke_model, ke_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_KE_v2')
ke_pipeline = CustomEssayPipeline(model=ke_model, tokenizer=ke_tokenizer)

cu0_pipeline = CUPipeline("CU0")
cu5_pipeline = CUPipeline("CU5")


# HELPER FUNCTIONS
# helpe function to generate ids

def generate_random_id():
    random_uuid = uuid.uuid4()
    random_id = random_uuid.hex
    return random_id


# helper function to output label
def check_lab(type, inp):
    pipeline = None
    if type == "PE":
        pipeline = pe_pipeline
    elif type == "LCE":
        pipeline = lce_pipeline
    elif type == "KE":
        pipeline = ke_pipeline
    elif type == "CU0":
        pipeline = cu0_pipeline
    elif type == "CU5":
        pipeline = cu5_pipeline
    else:
        return "unacceptable"

    lab = pipeline(inp)

    if lab[0] == 'unacceptable' or lab[0] == 'unacceptable':
        return "unacceptable"
    else:
        return "acceptable"


def index(request):
    return render_nextjs_page_sync(request)


if MODEL_TYPE == "mistral":
    # Load mistral model
    model, tokenizer = load_mistral_model()

    # load in LORA fine-tune for student answer examples
    # lora_model_path = "ntseng/mistralai_Mistral-7B-Instruct-v0_2_student_answer_train_examples_mistral_0416"
    # model = PeftModel.from_pretrained(
    #     model, lora_model_path, torch_dtype=torch.float16, force_download=True,
    # )
    mistral_pipeline = MistralPipeline(model, tokenizer, task="base")
    spelling_pipeline = MistralPipeline(model, tokenizer, task="spelling")
    negation_pipeline = MistralPipeline(model, tokenizer, task="negation")
    synonym_pipeline = MistralPipeline(model, tokenizer, task="synonyms")
    paraphrase_pipeline = MistralPipeline(model, tokenizer, task="paraphrase")
    acronyms_pipeline = MistralPipeline(model, tokenizer, task="acronyms")
    antonyms_pipeline = MistralPipeline(model, tokenizer, task="antonyms")
    spanish_pipeline = MistralPipeline(model, tokenizer, task="spanish")
    custom_pipeline = MistralPipeline(model, tokenizer, task="custom")

else:
    mistral_pipeline = None
    spelling_pipeline = None
    negation_pipeline = None
    synonym_pipeline = None
    paraphrase_pipeline = None
    acronyms_pipeline = None
    antonyms_pipeline = None
    spanish_pipeline = None
    custom_pipeline = None

pipeline_map = {
    "spelling": spelling_pipeline,
    # "negation": negation_pipeline,
    "synonyms": synonym_pipeline,
    "paraphrase": paraphrase_pipeline,
    "acronyms": acronyms_pipeline,
    "antonyms": antonyms_pipeline,
    "spanish": spanish_pipeline
}

custom_pipeline_map = {
    # will fill up with custom perturbations
}

obj_lce = create_obj(mistral=mistral_pipeline, essayPipeline=lce_pipeline, type="LCE")
obj_pe = create_obj(mistral=mistral_pipeline, essayPipeline=pe_pipeline, type="PE")
obj_ke = create_obj(mistral=mistral_pipeline, essayPipeline=ke_pipeline, type="KE")
obj_cu0 = create_obj(mistral=mistral_pipeline, essayPipeline=cu0_pipeline, type="CU0")
obj_cu5 = create_obj(mistral=mistral_pipeline, essayPipeline=cu5_pipeline, type="CU5")

df_map = {"LCE": obj_lce.df, "PE": obj_pe.df, "KE": obj_ke.df, "CU0": obj_cu0.df, "CU5": obj_cu5.df}


# create default vals in db
@api_view(['POST'])
def init_database(request):
    global obj_lce, obj_pe, obj_ke, obj_cu0, obj_cu5, pe_pipeline, ke_pipeline, lce_pipeline, cu0_pipeline, cu5_pipeline
    obj_lce = create_obj(mistral=mistral_pipeline, essayPipeline=lce_pipeline, type="LCE")
    obj_pe = create_obj(mistral=mistral_pipeline, essayPipeline=pe_pipeline, type="PE")
    obj_ke = create_obj(mistral=mistral_pipeline, essayPipeline=ke_pipeline, type="KE")
    obj_cu0 = create_obj(mistral=mistral_pipeline, essayPipeline=cu0_pipeline, type="CU0")
    obj_cu5 = create_obj(mistral=mistral_pipeline, essayPipeline=cu5_pipeline, type="CU5")

    # PE KE LCE for this user study will have nothing
    data = obj_lce.df.head(0)
    for index, row in data.iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=index, title=row['input'], topic="LCE", label=check_lab("LCE", row['input']),
                   ground_truth=row['output'])
        obj.save()

    data = obj_pe.df.head(0)
    for index, row in data.iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=index, title=row['input'], topic="PE", label=check_lab("PE", row['input']),
                   ground_truth=row['output'])
        obj.save()

    data = obj_ke.df.head(0)
    for index, row in data.iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=index, title=row['input'], topic="KE", label=check_lab("KE", row['input']),
                   ground_truth=row['output'])
        obj.save()

    data = obj_cu0.df.head(11)
    for index, row in data.iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=index, title=row['input'], topic="CU0", label=check_lab("CU0", row['input']),
                   ground_truth=row['output'])
        obj.save()

    data = obj_cu5.df.head(11)
    for index, row in data.iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=index, title=row['input'], topic="CU5", label=check_lab("CU5", row['input']),
                   ground_truth=row['output'])
        obj.save()

    return Response("All initial tests loaded!")

