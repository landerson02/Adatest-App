from django_nextjs.render import render_nextjs_page_sync
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from core.ada import *
from .models import *
from .serializer import ReactSerializer, TestSerializer


def index(request):
    return render_nextjs_page_sync(request)
    # return HttpResponse("Hello, world. You're at the polls index.")


# Create your views here.

obj = create_obj()




@api_view(['GET'])
def test_get(request):
    data = Test.objects.all()

    serializer = TestSerializer(data, context={'request': request}, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def test_generate(request): 
    obj.generate()
    data = obj.df
    for index, row in data.iterrows():
        if row['topic'].__contains__("suggestions"): 
            test = Test(id=index, title=row['input'], topic=row['topic'], label=row['output'])
            test.save()
            # if Test.objects.filter(title=test_list.title).exists():  # does not work with get
            #     pass
            # else:
            #     test.save()
    testData = Test.objects.all()
    serializer = TestSerializer(testData, context={'request': request}, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def test_update_approved(request, pk): 
    Test.objects.get(id = pk).update(validity = "Approved")



@api_view(['POST'])
def test_update_label(request, pk): 
    Test.objects.get(id = pk).update(validity = "Mislabeled")


@api_view(['DELETE'])
def test_clear(request): 
    tests = Test.objects.all()
    for test in tests:
        if test.topic.__contains__('suggestions'):  
            test.delete()
    return Response("All tests cleared!")



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
