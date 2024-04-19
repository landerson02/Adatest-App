import json
import os
import sqlite3

import pandas as pd
import torch
from adatest import *
from core.ada import *
from django.db.models.lookups import *
from django_nextjs.render import render_nextjs_page_sync
from peft import PeftModel  # for fine-tuning
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from transformers import AutoTokenizer
from transformers import BitsAndBytesConfig, AutoModelForCausalLM

from .ada import MistralPipeline
from .models import *
from .serializer import ReactSerializer, TestSerializer


def index(request):
    return render_nextjs_page_sync(request)
    # return HttpResponse("Hello, world. You're at the polls index.")


# Create your views here.
model_name_or_path = "mistralai/Mistral-7B-Instruct-v0.2"
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
lora_model_path = "ntseng/mistralai_Mistral-7B-Instruct-v0.2-testgen-LoRAs"
model = PeftModel.from_pretrained(
        model, lora_model_path, torch_dtype=torch.float16, force_download=True,
    )
mistral_pipeline = MistralPipeline(model, tokenizer)

obj_lce = create_obj(mistral=mistral_pipeline)
obj_pe = create_obj(type="PE", mistral=mistral_pipeline)
obj_ke = create_obj(type="KE", mistral=mistral_pipeline)

@api_view(['POST'])
def init_database(request):
    data = obj_lce.df
    for index, row in data.iterrows():
        obj = Test(id=index, title=row['input'], topic="LCE", label=row['output'])
        if Test.objects.filter(title=obj.title).exists():  # does not work with get
            pass
        else:
            obj.save()

    data = obj_pe.df
    for index, row in data.iterrows():
        obj = Test(id=index, title=row['input'], topic="PE", label=row['output'])
        if Test.objects.filter(title=obj.title).exists():  # does not work with get
            pass
        else:
            obj.save()

    data = obj_ke.df
    for index, row in data.iterrows():
        obj = Test(id=index, title=row['input'], topic="KE", label=row['output'])
        if Test.objects.filter(title=obj.title).exists():  # does not work with get
            pass
        else:
            obj.save()


@api_view(['GET'])
def test_get(request, my_topic):
    data = Test.objects.filter(topic__icontains=my_topic)
    serializer = TestSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_all(request):
    data = Test.objects.all()
    serializer = TestSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def test_generate(request, topic):
    if topic == "KE":
        obj_ke.generate()
        data = obj_ke.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_KE", label=row['output'])
                test.save()
                # if Test.objects.filter(title=test_list.title).exists():  # does not work with get
                #     pass
                # else:
                #     test.save()

    elif topic == "PE":
        obj_pe.generate()
        data = obj_pe.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_PE", label=row['output'])
                test.save()
                # if Test.objects.filter(title=test_list.title).exists():  # does not work with get
                #     pass
                # else:
                #     test.save()

    else:
        obj_lce.generate()
        data = obj_lce.df
        for index, row in data.iterrows():
            if row['topic'].__contains__("suggestions"):
                test = Test(id=index, title=row['input'], topic="suggested_LCE", label=row['output'])
                test.save()
                # if Test.objects.filter(title=test_list.title).exists():  # does not work with get
                #     pass
                # else:
                #     test.save()

    testData = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(testData, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
<<<<<<< HEAD
<<<<<<< HEAD
def approve_list(request, topic): 
    
    byte_string = request.body 
=======
def approve_list(request, topic):
    byte_string = request.body
>>>>>>> main
=======
def approve_list(request, topic):
    byte_string = request.body
>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
<<<<<<< HEAD
<<<<<<< HEAD
        testData = Test.objects.get(id = id)
        
     
=======
        testData = Test.objects.get(id=id)

>>>>>>> main
=======
        testData = Test.objects.get(id=id)

>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7
        testData.validity = "Approved"

        testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
<<<<<<< HEAD
<<<<<<< HEAD
    
=======

>>>>>>> main
=======

>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7
    return Response(serializer.data)


@api_view(['POST'])
def deny_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
<<<<<<< HEAD
<<<<<<< HEAD
        testData = Test.objects.get(id = id)
        
        testData.validity = "Denied"
        testData.save()

=======
=======
>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7
        testData = Test.objects.get(id=id)

        testData.validity = "Denied"
        testData.save()
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def log_action(request):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    body_dict = json.loads(body)
    print(body_dict)
    essay = body_dict['data']['essay']
    action = body_dict['data']['action']

    log = Log(essay=essay, action=action)
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
    db_df = pd.read_sql_query("SELECT * FROM core_log", conn)
    db_df.to_csv('log.csv', index=False)

    return Response("Data saved to CSV successfully!")


@api_view(['POST'])
def invalidate_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
<<<<<<< HEAD
<<<<<<< HEAD
        testData = Test.objects.get(id = id)
        print(testData)
        testData.delete()
        
=======
=======
>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7
        testData = Test.objects.get(id=id)

        testData.validity = "Invalid"
        testData.save()
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> a61de0f47e51c47077f6028ba209afdb63aa54e7

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def test_clear(request):
    tests = Test.objects.all()
    for test in tests:
        test.delete()
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
