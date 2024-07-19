import csv
import json

from ..models import *
from .views import *


@api_view(['POST'])
def add_topic(request):
    """
    Adds a new topic to the database
    :param request: topic and tests: {topic: str, tests: [{test: str, ground_truth: str}]}
    :return: All tests for the provided topic
    """

    data = json.loads(request.body.decode("utf-8"))

    new_topic = data['topic']
    new_prompt_topic = data['prompt_topic']
    tests = data['tests']

    # set header for csv file
    new_data = [['', 'topic', 'input', 'output', 'label', 'labeler', 'description', 'author', 'model score']]
    # add tests for csv file
    for test in tests:
        new_data.append(
            [generate_random_id(), '', test['test'], test['ground_truth'], 'pass', 'adatest_default', '', '', '']
        )

    directory = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Tests'))
    file_path = os.path.join(directory, f'NTX_{new_topic}.csv')

    # write to csv file
    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(new_data)  # Writing all rows including the header

    if MODEL_TYPE == "mistral":
        grader_pipelines[new_topic] = GeneralGraderPipeline(llama_grade_model, llama_grade_tokenizer, task=new_prompt_topic)
    else:
        grader_pipelines[new_topic] = cu0_pipeline

    obj_map[new_topic] = create_obj(model=gen_pipeline, essayPipeline=grader_pipelines[new_topic], type=new_topic)
    df_map[new_topic] = obj_map[new_topic].df

    for i, row in df_map[new_topic].head(11).iterrows():
        if row['input'] == '':
            continue

        label = check_lab(new_topic, row['input'])
        validity = 'approved' if label == row['output'] else 'denied'
        obj = Test(id=i, title=row['input'], validity=validity, topic=new_topic, label=label,
                   ground_truth=row['output'])
        obj.save()

    return Response("Topic added successfully!")


@api_view(['DELETE'])
def delete_topic(request):
    """
    Deletes a topic from the database
    :param request: topic: str
    :return: All topics in the database
    """
    data = json.loads(request.body.decode("utf-8"))
    top = data['topic']

    # delete all tests for the topic
    Perturbation.objects.filter(topic=top).delete()
    Test.objects.filter(topic=top).delete()
    del grader_pipelines[top]
    del obj_map[top]
    del df_map[top]

    return Response("Topic deleted successfully!")


@api_view(['GET'])
def get_topics(request):
    """
    Gets all topics from the db
    """
    topics = Test.objects.values_list('topic', flat=True).distinct()
    return Response([x for x in list(topics) if not x.startswith('suggested_')])


@api_view(['POST'])
def test_topic_prompt(request):
    """
    Tests a topic prompt
    :param request: topic: str, prompt: str
    :return: The model's score for the prompt
    """
    data = json.loads(request.body.decode("utf-8"))

    prompt = data['prompt']
    test = data['test']

    test_pipeline = GeneralGraderPipeline(llama_grade_model, llama_grade_tokenizer, task=prompt) if MODEL_TYPE == "mistral" else cu0_pipeline
    response = test_pipeline(test)

    return Response(response)
