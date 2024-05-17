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

grader_pipelines = {
    "LCE": lce_pipeline,
    "PE": pe_pipeline,
    "KE": ke_pipeline,
    "CU0": cu0_pipeline,
    "CU5": cu5_pipeline
}


# HELPER FUNCTIONS

# helper function to generate ids
def generate_random_id():
    random_uuid = uuid.uuid4()
    random_id = random_uuid.hex
    return random_id


# helper function for output label
def check_lab(type, inp):
    if type not in grader_pipelines.keys():
        return 'unacceptable'

    pipeline = grader_pipelines[type]
    lab = pipeline(inp)
    return lab[0].lower() if lab[0].lower() in ['acceptable', 'unacceptable'] else 'unacceptable'


def index(request):
    return render_nextjs_page_sync(request)


if MODEL_TYPE == "mistral":
    # Load mistral model
    model, tokenizer = load_mistral_model()

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

pert_pipeline_map = {
    "spelling": spelling_pipeline,
    "negation": negation_pipeline,
    "synonyms": synonym_pipeline,
    "paraphrase": paraphrase_pipeline,
    "acronyms": acronyms_pipeline,
    "antonyms": antonyms_pipeline,
    "spanish": spanish_pipeline
}

custom_pert_pipeline_map = {
    # will fill up with custom perturbations
}

obj_map = {}
df_map = {}

for topic, pipeline in grader_pipelines.items():
    obj_map[topic] = create_obj(mistral=mistral_pipeline, essayPipeline=pipeline, type=topic)


# create default vals in db
@api_view(['POST'])
def init_database(request):
    global obj_map, grader_pipelines
    for top, pipe in grader_pipelines.items():
        obj_map[top] = create_obj(mistral=mistral_pipeline, essayPipeline=pipe, type=top)
        df_map[top] = obj_map[top].df
        # PE KE LCE for this user study will have no tests
        numTestsInit = 10 if top in ['CU0', 'CU5'] else 0
        data = obj_map[top].df.head(numTestsInit)
        for i, row in data.iterrows():
            if row['input'] == '':
                continue
            obj = Test(id=i, title=row['input'], topic=top, label=check_lab(top, row['input']),
                       ground_truth=row['output'])
            obj.save()

    return Response("All initial tests loaded!")
