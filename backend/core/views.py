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

from .ada import *
from .ada import MistralPipeline
from .models import *
from .serializer import PerturbationSerializer, ReactSerializer, TestSerializer

load_dotenv()
# Check if MODEL is in .env file
if "MODEL" not in os.environ:
    raise ValueError("the env file is wrong")

MODEL_TYPE = os.getenv('MODEL')

# helper objects

lce_model, lce_tokenizer = load_model('aanandan/FlanT5_AdaTest_LCE_v2')
lce_pipeline = CustomEssayPipeline(model=lce_model, tokenizer=lce_tokenizer)

pe_model, pe_tokenizer = load_model('aanandan/FlanT5_AdaTest_PE_v2')
pe_pipeline = CustomEssayPipeline(model=pe_model, tokenizer=pe_tokenizer)

ke_model, ke_tokenizer = load_model('aanandan/FlanT5_AdaTest_KE_v2')
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
        return "Unacceptable"

    lab = pipeline(inp)

    if lab[0] == 'unacceptable' or lab[0] == 'Unacceptable':
        return "Unacceptable"
    else:
        return "Acceptable"


def index(request):
    return render_nextjs_page_sync(request)


if MODEL_TYPE == "mistral":
    # Create your views here.
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
    "negation": negation_pipeline,
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


## get all tests for a given topic
@api_view(['GET'])
def test_get(request, my_topic):
    data = Test.objects.filter(topic__icontains=my_topic)
    serializer = TestSerializer(data, many=True)
    return Response(serializer.data)


## get all tests overall
@api_view(['GET'])
def get_all(request):
    data = Test.objects.all()
    serializer = TestSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


## generate tests using adatest
@api_view(['POST'])
def test_generate(request, topic):
    if topic == "KE":
        obj_ke.generate()
        data = obj_ke.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_KE", label=row['output'])
                test.save()
    elif topic == "PE":
        obj_pe.generate()
        data = obj_pe.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_PE", label=row['output'])
                test.save()
    elif topic == "LCE":
        obj_lce.generate()
        data = obj_lce.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_LCE", label=row['output'])
                test.save()
    elif topic == "CU0":
        obj_cu0.generate()
        data = obj_cu0.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_CU0", label=check_lab("CU0", row['input']))
                test.save()
    elif topic == "CU5":
        obj_cu5.generate()
        data = obj_cu5.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_CU5", label=check_lab("CU5", row['input']))
                test.save()

    testData = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(testData, context={'request': request}, many=True)
    return Response(serializer.data)


## approve a list of tests
@api_view(['POST'])
def approve_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    df = df_map[topic]

    for obj in data:
        id = obj["id"]
        testData = Test.objects.get(id=id)

        testData.ground_truth = testData.label
        testData.validity = "Approved"

        df_row = df.loc[df['input'] == testData.title]
        df_row["topic"] = ""

        testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)

    return Response(serializer.data)


## deny a list of tests
@api_view(['POST'])
def deny_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
        testData = Test.objects.get(id=id)

        testData.validity = "Denied"

        if testData.label == "Unacceptable":
            testData.ground_truth = "Acceptable"
        else:
            testData.ground_truth = "Unacceptable"

        testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_test(request, topic, ground_truth):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)
    data = data['test']

    gen_label = check_lab(topic, data['title'])
    if gen_label == ground_truth:
        validity = "Approved"
    else:
        validity = "Denied"

    testData = Test(id=generate_random_id(), title=data['title'], topic=topic, validity=validity, label=gen_label,
                    ground_truth=ground_truth)
    testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def edit_test(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)
    data = data['test']

    gen_label = check_lab(topic, data['title'])

    id_val = data['id']

    testData = Test.objects.get(id=id_val)

    testData.title = data['title']
    testData.label = gen_label
    testData.validity = "Unapproved"
    testData.ground_truth = "Unknown"
    testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def edit_perturbation(request, topic):
    # byte_string = request.body
    # body = byte_string.decode("utf-8")
    # data = json.loads(body)

    # Get test from request body
    test = json.loads(request.body.decode('utf-8'))['test']
    print('test')
    print(test)


    new_label = check_lab(topic, test['title'])

    perturbTest = Perturbation.objects.get(id=test["id"])
    parentTest = Test.objects.get(id=perturbTest.test_parent.id)
    print('parent:')
    print(parentTest)

    perturbTest.title = test["title"]
    perturbTest.label = new_label
    perturbTest.validity = "Unapproved"
    perturbTest.save()

    test = Perturbation.objects.all()
    serializer = PerturbationSerializer(test, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def log_action(request):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    body_dict = json.loads(body)
    test_ids = body_dict['data']['test_ids']
    action = body_dict['data']['action']

    log = Log(test_ids=test_ids, action=action)
    try:
        log.save()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response("Log Successfully Added!")


@api_view(['POST'])
def save_log(request):
    dir = os.path.dirname(os.getcwd())
    conn = sqlite3.connect('db.sqlite3', isolation_level=None,
                           detect_types=sqlite3.PARSE_COLNAMES)
    # Save log table to csv called log.csv
    log_df = pd.read_sql_query("SELECT * FROM core_log", conn)
    log_df.to_csv('log.csv', index=False)
    # Save perturbations table to csv called log.csv
    perturbations_df = pd.read_sql_query("SELECT * FROM core_perturbation", conn)
    perturbations_df.to_csv('perturbations.csv', index=False)
    # Save tests table to csv called log.csv
    tests_df = pd.read_sql_query("SELECT * FROM core_test", conn)
    tests_df.to_csv('tests.csv', index=False)

    # Close the database connection
    conn.close()

    return Response("Data saved to CSV successfully!")


# invalidate a list of tests and delete from df
@api_view(['POST'])
def invalidate_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    df = df_map[topic]

    for obj in data:
        id = obj["id"]
        testData = Test.objects.get(id=id)

        testData.title = obj["title"]
        indexAge = df[df['input'] == testData.title].index
        df.drop(indexAge, inplace=True)

        testData.validity = "Invalid"
        testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def test_clear(request):
    tests = Test.objects.all()
    perturbations = Perturbation.objects.all()

    for test in tests:
        test.delete()

    for perturbation in perturbations:
        perturbation.delete()

    global custom_pipeline_map
    custom_pipeline_map = {}

    return Response("All tests cleared!")


@api_view(['DELETE'])
def log_clear(request):
    logs = Log.objects.all()
    for log in logs:
        log.delete()
    return Response("All logs cleared!")


@api_view(['DELETE'])
def test_delete(request, pk):
    test = Test.objects.get(id=pk)
    test.delete()

    return Response('Test Successfully Deleted!')


@api_view(['POST'])
def generate_perturbations(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
        testData = Test.objects.get(id=id)
        pertList = Perturbation.objects.filter(test_parent=testData)

        for perturb_str, pipeline in pipeline_map.items():
            if pertList.filter(type=perturb_str).exists():
                continue

            if pipeline is not None:
                perturbed_test = pipeline(testData.title)
                print(perturb_str)
                print(perturbed_test)
                perturbed_test = perturbed_test[0]['generated_text']
            else:
                perturbed_test = testData.title

            perturbed_label = check_lab(topic, perturbed_test)

            if perturb_str == "negation" or perturb_str == "antonyms":
                if testData.ground_truth == "Acceptable":
                    perturbed_gt = "Unacceptable"
                else:
                    perturbed_gt = "Acceptable"
            else:
                if testData.ground_truth == "Acceptable":
                    perturbed_gt = "Acceptable"
                else:
                    perturbed_gt = "Unacceptable"

            if testData.ground_truth == perturbed_label:
                if perturb_str == "negation" or perturb_str == "antonyms":
                    perturbed_validity = "Denied"
                else:
                    perturbed_validity = "Approved"
            else:
                if perturb_str == "negation" or perturb_str == "antonyms":
                    perturbed_validity = "Approved"
                else:
                    perturbed_validity = "Denied"

            perturbed_id = generate_random_id()

            perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                       title=perturbed_test, type=perturb_str, validity=perturbed_validity, ground_truth=perturbed_gt)
            perturbData.save()

        for perturb_str, pipeline in custom_pipeline_map.items():
            if pertList.filter(type=perturb_str).exists():
                continue

            if custom_pipeline is not None:
                perturbed_test = custom_pipeline(f'{pipeline["prompt"]}: {testData.title}')
                print(perturb_str)
                print(perturbed_test)
                perturbed_test = perturbed_test[0]['generated_text']
            else:
                perturbed_test = testData.title

            perturbed_label = check_lab(topic, perturbed_test)

            if pipeline["flip_label"]:
                if testData.ground_truth == "Acceptable":
                    perturbed_gt = "Unacceptable"
                else:
                    perturbed_gt = "Acceptable"
            else:
                if testData.ground_truth == "Acceptable":
                    perturbed_gt = "Acceptable"
                else:
                    perturbed_gt = "Unacceptable"

            if testData.ground_truth == perturbed_label:
                if pipeline["flip_label"]:
                    perturbed_validity = "Denied"
                else:
                    perturbed_validity = "Approved"
            else:
                if pipeline["flip_label"]:
                    perturbed_validity = "Approved"
                else:
                    perturbed_validity = "Denied"

            perturbed_id = generate_random_id()

            perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                    title=perturbed_test, type=perturb_str, validity=perturbed_validity, ground_truth=perturbed_gt)
            perturbData.save()


    allPerturbs = Perturbation.objects.all()
    serializer = PerturbationSerializer(allPerturbs, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_perturbations(request):
    data = Perturbation.objects.all()
    serializer = PerturbationSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def validate_perturbations(request, validation):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    data = json.loads(body)

    if validation not in ["Approved", "Denied", "Invalid"]:
        return Response("Invalid validation type", status=status.HTTP_400_BAD_REQUEST)

    for obj in data:
        id = obj["id"]
        perturbData = Perturbation.objects.get(id=id)

        if validation == "Approved":
            perturbData.ground_truth = perturbData.label
            perturbData.validity = "Approved"
        elif validation == "Denied":
            if perturbData.label == "Unacceptable":
                perturbData.ground_truth = "Acceptable"
            else:
                perturbData.ground_truth = "Unacceptable"
            perturbData.validity = "Denied"
        else:
            perturbData.validity = "Invalid"

        perturbData.save()

    data = Perturbation.objects.all()
    serializer = PerturbationSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def add_new_pert(request, topic):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    data = json.loads(body)

    test_list = data['test_list']
    prompt = data['prompt']
    flip_label = data['flip_label']
    pert_name = data['pert_name']

    global custom_pipeline, custom_pipeline_map

    if pert_name in custom_pipeline_map.keys() or pert_name in pipeline_map.keys():
        return Response("Invalid perturbation type", status=status.HTTP_400_BAD_REQUEST)

    custom_pipeline_map[pert_name] = {"prompt": prompt, "flip_label": flip_label}

    for test in test_list:
        id = test["id"]
        testData = Test.objects.get(id=id)

        if custom_pipeline is not None:
            perturbed_test = custom_pipeline(f'{prompt}: {testData.title}')
            print(perturbed_test)
            perturbed_test = perturbed_test[0]['generated_text']
        else:
            perturbed_test = testData.title

        perturbed_label = check_lab(topic, perturbed_test)

        if flip_label:
            if testData.ground_truth == "Acceptable":
                perturbed_gt = "Unacceptable"
            else:
                perturbed_gt = "Acceptable"
        else:
            if testData.ground_truth == "Acceptable":
                perturbed_gt = "Acceptable"
            else:
                perturbed_gt = "Unacceptable"

        if testData.ground_truth == perturbed_label:
            if flip_label:
                perturbed_validity = "Denied"
            else:
                perturbed_validity = "Approved"
        else:
            if flip_label:
                perturbed_validity = "Approved"
            else:
                perturbed_validity = "Denied"

        perturbed_id = generate_random_id()

        perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                   title=perturbed_test, type=pert_name, validity=perturbed_validity,
                                   ground_truth=perturbed_gt)
        perturbData.save()

    data = Perturbation.objects.all()
    serializer = PerturbationSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def test_new_pert(request, topic):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    data = json.loads(body)

    test_case = data['test_case']
    prompt = data['prompt']
    pert_name = data['pert_name']

    global custom_pipeline

    if custom_pipeline is not None:
        perturbed_test = custom_pipeline(f'{prompt}: {test_case}')
        print(perturbed_test)
        perturbed_test = perturbed_test[0]['generated_text']
    else:
        perturbed_test = test_case

    return Response(perturbed_test)

class ReactView(APIView):
    serializer_class = ReactSerializer

    def get(self, request):
        # detail = [ {"name": detail.topic,"detail": detail.topic, "id": detail.id, "topic": detail.topic}
        # for detail in Test.objects.all()]
        # return Response(detail)
        dummy_data = [
            {"test": "django1", "output": "Acceptable", "concept": "PE", "id": 1, "label": 'labelx'},
            {"test": "django2", "output": "Unacceptable", "concept": "PE", "id": 2, "label": 'labelx'},
            {"test": "django3", "output": "Acceptable", "concept": "PE", "id": 3, "label": 'labelx'},
        ]
        return Response(dummy_data)

    def post(self, request):
        serializer = ReactSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
