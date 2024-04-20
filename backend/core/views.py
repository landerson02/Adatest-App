import json
import os
import sqlite3
import uuid

import pandas as pd
from django.core.management import call_command
from django.db.models.lookups import *
from django_nextjs.render import render_nextjs_page_sync
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .ada import *
from .models import *
from .serializer import ReactSerializer, TestSerializer



## helper objects 

lce_model, lce_tokenizer = load_model(f'aanandan/FlanT5_AdaTest_LCE_v2')
lce_pipeline = CustomEssayPipeline(model=lce_model, tokenizer=lce_tokenizer)


pe_model, pe_tokenizer = load_model(f'aanandan/FlanT5_AdaTest_PE_v2')
pe_pipeline = CustomEssayPipeline(model=pe_model, tokenizer=pe_tokenizer)


ke_model, ke_tokenizer = load_model(f'aanandan/FlanT5_AdaTest_KE_v2')
ke_pipeline = CustomEssayPipeline(model=ke_model, tokenizer=ke_tokenizer)


## helper function to output label 
def check_lab(type, inp):
    pipeline = None
    if type == "PE": 
        pipeline = pe_pipeline
    elif type == "LCE": 
        pipeline = lce_pipeline

    else: 
        pipeline = ke_pipeline

    lab = pipeline(input)

    if lab[0] == 'unacceptable' or 'Unacceptable': 
        return "Unacceptable"
    
    else: 
        return "Acceptable"
    

def index(request):
    return render_nextjs_page_sync(request)
    # return HttpResponse("Hello, world. You're at the polls index.")


# Create your views here.


## main dfs for views
obj_lce = create_obj()
obj_pe = create_obj(type="PE")
obj_ke = create_obj(type="KE")


## create default vals in db 
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



## get all tests for a given topic 
@api_view(['GET'])
def test_get(request, my_topic):
    data = Test.objects.filter(topic__icontains=my_topic)
    serializer = TestSerializer(data, context={'request': request}, many=True)
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



## approve a list of tests
@api_view(['POST'])
def approve_list(request, topic):
    byte_string = request.body

    body = byte_string.decode("utf-8")

    data = json.loads(body)

    for obj in data:
        id = obj["id"]
        testData = Test.objects.get(id=id)

        print(obj)

        testData.title = obj["title"]

        testData.validity = "Approved"


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

        testData.title = obj["title"]
        testData.validity = "Denied"
        testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_test(request, topic): 

    gen_label = check_lab(topic, request['title'])
    testData = Test(id = request['id'], title = request['title'], topic = topic, label = gen_label)
    testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)
    
@api_view(['POST'])
def edit_test(request, topic):

    id_val = request.POST['id']
    new_title = request.POST['title']

    testData = Test.objects.get(id = id_val)

    testData.title = new_title
    testData.save()

    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)
    

@api_view(['POST'])
def log_action(request):
    byte_string = request.body
    body = byte_string.decode("utf-8")
    body_dict = json.loads(body)
    # print(body_dict)
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
        testData = Test.objects.get(id=id)

        testData.title = obj["title"]

        testData.validity = "Invalid"
        testData.save()

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
