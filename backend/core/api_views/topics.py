import json
import csv

from .views import *
from ..models import *
from ..serializer import TestSerializer


@api_view(['POST'])
def add_topic(request):
    """
    Adds a new topic to the database
    :param request: topic and tests: {topic: str, tests: [{test: str, ground_truth: str}]}
    :return: All tests for the provided topic
    """

    data = json.loads(request.body.decode("utf-8"))

    new_topic = data['topic']
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

    grader_pipelines[new_topic] = cu0_pipeline  # TODO: change this to the llama general grader pipeline
    obj_map[new_topic] = create_obj(mistral=mistral_pipeline, essayPipeline=grader_pipelines[new_topic], type=new_topic)
    df_map[new_topic] = obj_map[new_topic].df

    for i, row in df_map[new_topic].head(11).iterrows():
        if row['input'] == '':
            continue
        obj = Test(id=i, title=row['input'], topic=new_topic, label=check_lab(new_topic, row['input']),
                   ground_truth=row['output'])
        obj.save()

    return Response("Topic added successfully!")


@api_view(['GET'])
def get_topics(request):
    """
    Gets all topics from the db
    """
    tests = Test.objects.values_list('topic', flat=True).distinct()
    return Response(list(tests))
