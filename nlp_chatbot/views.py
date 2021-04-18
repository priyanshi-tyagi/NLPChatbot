from django.shortcuts import render
from . import ml
from django.http import JsonResponse
import json
from json import dumps
import os

unique_values = ml.get_unique_values()
datapath = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'data'))

def home(request):
    return render(request, "index.html")

def dashboard(request):
    with open(datapath + '/insights.json') as f:
        data = json.load(f)
    
    univariate_insights = data["univariate"]
    bivariate_insights = data["bivariate"]

    cols = list(unique_values.keys())
    cols= [col.replace("_", " ") for col in cols]

    return render(request, "dashboard.html", {
        'cols': cols,
        'univariate_insights': univariate_insights,
        'bivariate_insights': bivariate_insights
    })

def aiml_models(request):
    return render(request, "aiml_models.html")

def chatbot(request):
    unique_values_json = dumps(unique_values)

    if request.is_ajax():
        country = request.GET['country'],
        local = request.GET['local']
        industry_sector = request.GET['industry_sector']
        gender = request.GET['gender'],
        employee_type = request.GET['employee_type']
        critical_risk = request.GET['critical_risk']
        accident_level = request.GET['accident_level']
        description = request.GET['description']

        prediction = ml.predict_model(description)

        response = {
            'prediction':"".join(prediction.tolist()) 
        }

        ml.write_csv(''.join(country), local, industry_sector, ''.join(gender), employee_type, critical_risk, accident_level, description, response['prediction'])
        
        return JsonResponse(response)
            
    return render(request, "chatbot.html", {'unique_data': unique_values_json})
