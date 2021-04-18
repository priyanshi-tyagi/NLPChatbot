from . import ml
from json import dumps

def data(request):
    unique_values = ml.get_unique_values()
    unique_values_json = dumps(unique_values)
    return {'data': unique_values_json}