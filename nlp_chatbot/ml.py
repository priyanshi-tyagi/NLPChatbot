import  os 
import pickle
import  pandas as pd
from csv import writer
from tensorflow.keras.preprocessing.text import Tokenizer
import nltk
import unicodedata
import  re
from tensorflow.keras.preprocessing.sequence import pad_sequences

datapath = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'data'))

df = pd.read_csv(datapath + '/IHMStefanini_industrial_safety_and_health_database_with_accidents_description.csv')
df.drop('Unnamed: 0', axis=1, inplace=True)

df.rename(columns = { 'Data' : 'Date',
                      'Industry Sector' : 'Industry_Sector', 
                      'Accident Level': 'Accident_Level',
                      'Countries' : 'Country',
                      'Genre' : 'Gender',
                      'Potential Accident Level' : 'Potential_Accident_Level',
                      'Employee or Third Party' : 'Employee_Type', 
                      'Critical Risk' : 'Critical_Risk'}, inplace = True)

'''def predict_model(description):        
    cv=pickle.load(open(datapath + '/tranform.pkl','rb'))
    clf = pickle.load(open(datapath + '/nlp_chatbot.sav','rb'))

    x = [description]
    vect = cv.transform(x).toarray()
    prediction = clf.predict(vect)
    return prediction'''


def des_cleaning(text):
    lemmatizer = nltk.stem.WordNetLemmatizer()
    stopwords = nltk.corpus.stopwords.words('english')
    text = (unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore').lower())
    words = re.sub(r'[^a-zA-Z.,!?/:;\"\'\s]', '', text).split()
    lemmatizer = nltk.stem.WordNetLemmatizer()
    lems = [lemmatizer.lemmatize(i) for i in words if i not in stopwords]
    words = [w for w in lems if len(w)>2]
    return words

def predict_model(description):
    tokenizer = Tokenizer()
    Bag_clf = pickle.load(open(datapath + '/nlp_chatbot.sav','rb'))

    data = " ".join(des_cleaning(description))
    x = tokenizer.texts_to_sequences([data])
    message = pad_sequences(x, maxlen = 93)
    prediction = Bag_clf.predict(message)
    return prediction

def get_unique_values():
    return {col: df[col].unique().tolist() for col in df.columns if (col !='Description') and (col !='Date') and (col != "Potential_Accident_Level")}

def write_csv(country, local, industry_sector, gender, employee_type, critical_risk, accident_level, description, prediction):

    List=[country, local, industry_sector, gender, employee_type, critical_risk, accident_level, description, prediction]

    try:
        with open(datapath + '/Test.csv', 'a') as f_object:
            writer_object = writer(f_object)
            writer_object.writerow(List)
            f_object.close()
    except Exception as err:
        print(err)

    