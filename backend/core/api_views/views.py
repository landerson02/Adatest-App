from django_nextjs.render import render_nextjs_page_sync
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..ada import *
from ..models import *
# from ..pipelines.flanT5Grader import *
from ..pipelines.robertaGrader import *
from ..pipelines.mistralGenerator import *

load_dotenv()
# Check if MODEL is in .env file
if "MODEL" not in os.environ:
    raise ValueError("the env file is wrong")

MODEL_TYPE = os.getenv('MODEL')

# helper objects

# lce_model, lce_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_LCE_v2')
# lce_pipeline = CustomEssayPipeline(model=lce_model, tokenizer=lce_tokenizer)
#
# pe_model, pe_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_PE_v2')
# pe_pipeline = CustomEssayPipeline(model=pe_model, tokenizer=pe_tokenizer)
#
# ke_model, ke_tokenizer = load_flant5_model('aanandan/FlanT5_AdaTest_KE_v2')
# ke_pipeline = CustomEssayPipeline(model=ke_model, tokenizer=ke_tokenizer)

cu0_pipeline = CUPipeline("CU0")
cu5_pipeline = CUPipeline("CU5")

grader_pipelines = {
    # "LCE": lce_pipeline,
    # "PE": pe_pipeline,
    # "KE": ke_pipeline,
    "CU0": cu0_pipeline,
    "CU5": cu5_pipeline
}


# HELPER FUNCTIONS

# helper function to generate ids
def generate_random_id():
    random_uuid = uuid.uuid4()
    random_id = random_uuid.hex
    return random_id


def check_lab(type, inp):
    """
    Checks AI Grade for test
    :param type: type/topic of pipeline
    :param inp: test input
    :return: acceptable/unacceptable
    """
    if type not in grader_pipelines.keys():
        return 'unacceptable'

    lab = grader_pipelines[type](inp)
    return lab[0].lower() if lab[0].lower() in ['acceptable', 'unacceptable'] else 'unacceptable'


def index(request):
    return render_nextjs_page_sync(request)


mistral_pipeline = None
custom_pipeline = None
pert_pipeline_map = {
    "spelling": None,
    "negation": None,
    "synonyms": None,
    "paraphrase": None,
    "acronyms": None,
    "antonyms": None,
    "spanish": None
}
custom_pert_pipeline_map = {
    # will fill up with custom perturbations
}

if MODEL_TYPE == "mistral":
    # Load mistral model
    model, tokenizer = load_mistral_model()

    mistral_pipeline = MistralPipeline(model, tokenizer, task="base")
    custom_pipeline = MistralPipeline(model, tokenizer, task="custom")

    for perturb_type in pert_pipeline_map.keys():
        pert_pipeline_map[perturb_type] = MistralPipeline(model, tokenizer, task=perturb_type)

obj_map = {}
df_map = {}

for topic, pipeline in grader_pipelines.items():
    obj_map[topic] = create_obj(mistral=mistral_pipeline, essayPipeline=pipeline, type=topic)
    df_map[topic] = obj_map[topic].df


# create default vals in db
@api_view(['POST'])
def init_database(request):
    global obj_map, grader_pipelines
    for top, pipe in grader_pipelines.items():
        obj_map[top] = create_obj(mistral=mistral_pipeline, essayPipeline=pipe, type=top)
        # PE KE LCE for this user study will have no tests
        data = obj_map[top].df.head(10)
        for i, row in data.iterrows():
            if row['input'] == '':
                continue
            obj = Test(id=i, title=row['input'], topic=top, label=check_lab(top, row['input']),
                       ground_truth=row['output'])
            obj.save()

    return Response("All initial tests loaded!")
