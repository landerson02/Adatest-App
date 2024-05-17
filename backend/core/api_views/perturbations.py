from rest_framework.decorators import api_view

from .views import *
from ..ada import *
from ..models import *


@api_view(['POST'])
def generate_perturbations(request, topic):
    """
    Generates perturbations for the provided topic and stores them in the database
    :param request: list of tests to perturb
    :param topic: current statement topic
    :return: All perturbations for the provided topic
    """

    # Load in list of tests
    tests = json.loads(request.body.decode("utf-8"))

    for test in tests:
        # Get test and list of perts for the test
        testData = Test.objects.get(id=test["id"])
        pertList = Perturbation.objects.filter(test_parent=testData)

        # TODO: Clean this up

        for perturb_str, pipeline in pipeline_map.items():
            if pertList.filter(type=perturb_str).exists():
                continue

            if pipeline is not None:
                perturbed_test = pipeline(testData.title)
                perturbed_test = perturbed_test[0]['generated_text']
            else:
                perturbed_test = testData.title

            perturbed_label = check_lab(topic, perturbed_test)

            if perturb_str == "negation" or perturb_str == "antonyms":
                if testData.ground_truth == "acceptable":
                    perturbed_gt = "unacceptable"
                else:
                    perturbed_gt = "acceptable"
            else:
                if testData.ground_truth == "acceptable":
                    perturbed_gt = "acceptable"
                else:
                    perturbed_gt = "unacceptable"

            if testData.ground_truth == perturbed_label:
                if perturb_str == "negation" or perturb_str == "antonyms":
                    perturbed_validity = "denied"
                else:
                    perturbed_validity = "approved"
            else:
                if perturb_str == "negation" or perturb_str == "antonyms":
                    perturbed_validity = "approved"
                else:
                    perturbed_validity = "denied"

            perturbed_id = generate_random_id()

            perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                       title=perturbed_test, type=perturb_str, validity=perturbed_validity,
                                       ground_truth=perturbed_gt)
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
                if testData.ground_truth == "acceptable":
                    perturbed_gt = "unacceptable"
                else:
                    perturbed_gt = "acceptable"
            else:
                if testData.ground_truth == "acceptable":
                    perturbed_gt = "acceptable"
                else:
                    perturbed_gt = "unacceptable"

            if testData.ground_truth == perturbed_label:
                if pipeline["flip_label"]:
                    perturbed_validity = "denied"
                else:
                    perturbed_validity = "approved"
            else:
                if pipeline["flip_label"]:
                    perturbed_validity = "approved"
                else:
                    perturbed_validity = "denied"

            perturbed_id = generate_random_id()

            perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                       title=perturbed_test, type=perturb_str, validity=perturbed_validity,
                                       ground_truth=perturbed_gt)
            perturbData.save()

    allPerturbs = Perturbation.objects.all()
    serializer = PerturbationSerializer(allPerturbs, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_perturbations(request):
    """
    Getter for perts
    :param request: None
    :return: All perturbations in the database
    """
    data = Perturbation.objects.all()
    serializer = PerturbationSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def edit_perturbation(request, topic):
    """
    Edits a perturbation in the database
    :param request: Perturbation to be edited
    :param topic: current topic
    :return: All perturbations for the provided topic
    """

    # Get test from request body
    test = json.loads(request.body.decode('utf-8'))['test']

    # Generate AI label
    new_label = check_lab(topic, test['title'])

    # Get perturbation from db and update fields
    perturbTest = Perturbation.objects.get(id=test["id"])

    perturbTest.title = test["title"]
    perturbTest.label = new_label
    perturbTest.validity = "unapproved"
    perturbTest.save()

    # Get all tests and return them
    test = Perturbation.objects.all()
    serializer = PerturbationSerializer(test, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def validate_perturbations(request, validation):
    """
    Validates a list of perturbations and updates their fields accordingly
    :param request: list of perturbations to validate
    :param validation: type of validation to apply
    :return: All perturbations in the database
    """

    # Load in pert list
    perts = json.loads(request.body.decode("utf-8"))

    if validation not in ["approved", "denied", "invalid"]:
        return Response("Invalid validation type", status=status.HTTP_400_BAD_REQUEST)

    # Iterate through perts and update fields
    for pert in perts:
        perturbData = Perturbation.objects.get(id=pert["id"])

        if validation == "approved":
            perturbData.ground_truth = perturbData.label
            perturbData.validity = "approved"
        elif validation == "denied":
            if perturbData.label == "unacceptable":
                perturbData.ground_truth = "acceptable"
            else:
                perturbData.ground_truth = "unacceptable"
            perturbData.validity = "denied"
        else:
            perturbData.validity = "invalid"

        perturbData.save()

    # Return all perts
    allPerts = Perturbation.objects.all()
    serializer = PerturbationSerializer(allPerts, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_new_pert(request, topic):
    """
    Adds a new pert type to the db and generates perturbations for the given tests
    :param request: new pert type to add (tests, prompt, flip_label, name)
    :param topic: current topic
    """

    # Load in new pert type and fields
    new_pert = json.loads(request.body.decode("utf-8"))

    test_list = new_pert['test_list']
    prompt = new_pert['prompt']
    flip_label = new_pert['flip_label']
    pert_name = new_pert['pert_name']

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
            if testData.ground_truth == "acceptable":
                perturbed_gt = "unacceptable"
            else:
                perturbed_gt = "acceptable"
        else:
            if testData.ground_truth == "acceptable":
                perturbed_gt = "acceptable"
            else:
                perturbed_gt = "unacceptable"

        if testData.ground_truth == perturbed_label:
            if flip_label:
                perturbed_validity = "denied"
            else:
                perturbed_validity = "approved"
        else:
            if flip_label:
                perturbed_validity = "approved"
            else:
                perturbed_validity = "denied"

        perturbed_id = generate_random_id()

        perturbData = Perturbation(test_parent=testData, label=perturbed_label, id=perturbed_id,
                                   title=perturbed_test, type=pert_name, validity=perturbed_validity,
                                   ground_truth=perturbed_gt)
        perturbData.save()

    data = Perturbation.objects.all()
    serializer = PerturbationSerializer(data, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def test_new_pert(request):
    """
    Tests a new perturbation type
    :param request: {statement: str, prompt: str, pert_name: str}
    :param topic: current topic
    :return: perturbed test case
    """

    # Load in data
    data = json.loads(request.body.decode("utf-8"))

    test_case = data['test_case']
    prompt = data['prompt']
    pert_name = data['pert_name']

    global custom_pipeline

    if custom_pipeline is not None:
        perturbed_test = custom_pipeline(f'{prompt}: {test_case}')
        perturbed_test = perturbed_test[0]['generated_text']
    else:
        perturbed_test = test_case

    return Response(perturbed_test)
