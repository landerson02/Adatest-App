import json

from django.db.models import Q

from .views import *
from ..models import *
from ..serializer import TestSerializer


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
def test_clear(request):
    """
    Removes all tests from the database
    """

    # delete all tests and perts
    Test.objects.all().delete()
    Perturbation.objects.all().delete()

    # reset perturbation pipelines
    for pert in ['spelling', 'negation', 'synonyms', 'paraphrase', 'acronyms', 'antonyms', 'spanish']:
        if MODEL_TYPE == "mistral":
            pert_pipeline_map[pert] = MistralPipeline(model, tokenizer, task=pert)
        else:
            pert_pipeline_map[pert] = None

    # clear custom perturbations
    custom_pert_pipeline_map.clear()

    # clear all custom topics
    for top in grader_pipelines.keys():
        if top not in ['PE', 'KE', 'LCE', 'CU0', 'CU5']:
            del grader_pipelines[top]
            del obj_map[top]
            del df_map[top]

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
