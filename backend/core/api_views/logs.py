import json
import sqlite3

from rest_framework import status

from .views import *
from ..ada import *
from ..models import *


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


@api_view(['DELETE'])
def log_clear(request):
    logs = Log.objects.all()
    for log in logs:
        log.delete()
    return Response("All logs cleared!")
