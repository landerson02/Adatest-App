import json
from rest_framework import status
from django.db.models import Q

from ..models import *
from ..serializer import TestSerializer
from .views import *


@api_view(['GET'])
def get_all_tests(request):
    """
    Gets all tests from the db
    """
    tests = Test.objects.all()
    serializer = TestSerializer(tests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_by_topic(request, topic):
    """
    Gets all tests for the provided topic
    :param request: empty body
    :param topic: current topic
    """
    suggested = f"suggested_{topic}"
    tests = Test.objects.filter(Q(topic=topic) | Q(topic=suggested))
    serializer = TestSerializer(tests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def test_generate(request, topic: str):
    """
    Generates test cases for the provided topic and stores them in the database
    :param request: empty body
    :param topic: current statement topic
    :return: All test cases for the provided topic
    """
    obj = obj_map[topic]
    obj.generate()
    data = obj.df
    for i, row in data.iterrows():
        if row['topic'].__contains__("suggestions"):
            test = Test(id=i, title=row['input'], topic=f'suggested_{topic}', label=check_lab(topic, row['input']))
            test.save()

    testData = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(testData, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def process_list(request, decision: str, topic: str):
    """
    Processes a list of tests based on the decision provided and updates the database accordingly
    :param request: list of test cases
    :param decision: approved, denied, or invalid
    :param topic: current statement topic
    :return: updated list of test cases
    """

    # Load in tests
    tests = json.loads(request.body.decode("utf-8"))
    df = df_map[topic]

    # Iterate through tests and update accordingly
    for test in tests:
        test_id = test["id"]

        # Get test from db
        testData = Test.objects.get(id=test_id)

        # Update fields
        testData.validity = decision

        if decision == "approved":
            testData.ground_truth = testData.label
            df_row = df.loc[df['input'] == testData.title]
            df_row["topic"] = ""
        elif decision == "denied":
            if testData.label == "unacceptable":
                testData.ground_truth = "acceptable"
            else:
                testData.ground_truth = "unacceptable"
        elif decision == "invalid":
            testData.title = test["title"]
            indexAge = df[df['input'] == testData.title].index
            df.drop(indexAge, inplace=True)

        testData.save()

    # Get all tests for the topic
    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_test(request, topic, ground_truth):
    """
    Adds a test to the database and returns all tests for the provided topic
    :param request: test case to be added
    :param topic: current topic
    :param ground_truth:
    :return: All tests for the provided topic
    """

    # Load in test from body and check AI label
    test = json.loads(request.body.decode("utf-8"))['test']
    gen_label = check_lab(topic, test['title'])
    if gen_label == ground_truth:
        validity = "approved"
    else:
        validity = "denied"

    # Create test and save to db
    testData = Test(id=generate_random_id(), title=test['title'], topic=topic, validity=validity, label=gen_label,
                    ground_truth=ground_truth)
    testData.save()

    # Add to adatest dataframe
    df = df_map[topic]
    df.loc[len(df)] = {'': testData.id, 'topic': '', 'input': testData.title, 'output': ground_truth, 'label': 'pass',
                       'labeler': 'adatest_default', 'description': '', 'author': '', 'model score': ''}

    # Get all tests for the topic and return them in response
    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def edit_test(request, topic):
    """
    Edits a test in the database and returns all tests for the provided topic
    :param request: test case to be edited
    :param topic: current topic
    :return: All tests for the provided topic
    """

    # Load in test and get AI label
    test = json.loads(request.body.decode("utf-8"))['test']
    gen_label = check_lab(topic, test['title'])

    # Load in test from db and update fields
    testData = Test.objects.get(id=test['id'])

    testData.title = test['title']
    testData.label = gen_label
    testData.validity = "unapproved"
    testData.ground_truth = "unknown"
    testData.save()

    # Get all tests and return them in response
    allTests = Test.objects.filter(topic__icontains=topic)
    serializer = TestSerializer(allTests, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def test_clear(request, config):
    """
    Removes all tests from the database
    """

    # delete all tests and perts
    Perturbation.objects.all().delete()
    Test.objects.all().delete()

    if config not in default_pert_pipeline_map:
        return Response("Invalid Configuration", status=status.HTTP_400_BAD_REQUEST)
    perts = default_pert_pipeline_map[config]

    # reset appConfig
    appConfig[0] = config

    # reset perturbation pipelines
    pert_pipeline_map.clear()
    for pert in perts:
        if MODEL_TYPE == "mistral":
            if appConfig[0] == "AIBAT" or appConfig[0] == "Mini-AIBAT":
                pert_pipeline_map[pert] = MistralPipeline(mistral_model, mistral_tokenizer, task=pert)
                custom_pipeline[0] = mistral_custom_pipeline
                gen_pipeline[0] = mistral_gen_pipeline
            if appConfig[0] == "M-AIBAT":
                pert_pipeline_map[pert] = LlamaGeneratorPipeline(llama_model, llama_tokenizer, task=pert)
                custom_pipeline[0] = llama_custom_pipeline
                gen_pipeline[0] = mistral_gen_pipeline
        else:
            pert_pipeline_map[pert] = None
            custom_pipeline[0] = None
            gen_pipeline[0] = None

    grader_pipelines.clear()
    grader_prompts.clear()
    obj_map.clear()
    df_map.clear()

    # reset grader prompts
    grader_prompts['CU0'] = 'Does the following sentence include an acceptable/unacceptable description of the physics concept: Greater height means greater potential energy? Here is the sentence:'
    grader_prompts['CU5'] = 'Does the following sentence include an acceptable/unacceptable description of the physics concept: Greater mass means greater energy? Here is the sentence:'
    grader_prompts['Food'] = 'Is this sentence an acceptable or unacceptable description of food and/or culture? Here is the sentence:'

    # reset grader pipelines
    if appConfig[0] == "M-AIBAT":
        grader_pipelines['CU0'] = GeneralGraderPipeline(llama_model, llama_tokenizer, task=grader_prompts['CU0']) if MODEL_TYPE == "mistral" else cu0_pipeline
        grader_pipelines['CU5'] = GeneralGraderPipeline(llama_model, llama_tokenizer, task=grader_prompts['CU5']) if MODEL_TYPE == "mistral" else cu5_pipeline
        grader_pipelines['Food'] = GeneralGraderPipeline(llama_model, llama_tokenizer, task=grader_prompts['Food']) if MODEL_TYPE == "mistral" else cu0_pipeline
    else:
        grader_pipelines['CU0'] = cu0_pipeline
        grader_pipelines['CU5'] = cu5_pipeline

    # clear custom perturbations
    custom_pert_pipeline_map.clear()

    return Response("All tests cleared!")


@api_view(['DELETE'])
def test_delete(request, id: str):
    """
    Deletes a test from the database
    :param request: test id
    """

    test = Test.objects.get(id=id)
    test.delete()

    return Response('Test Successfully Deleted!')
