var dataset, chart, bichart;
var isUnivariate = true;
value_counts_dict = pot_acc_levels = countries = locals = ind_sectors = acc_levels = genders = emp_types = critical_risks = [];
uniques_dict = {}

promise = d3.csv("https://raw.githubusercontent.com/priyanshi-tyagi/NLPChatbot/main/IHMStefanini_industrial_safety_and_health_database_with_accidents_description.csv");
promise.then(makeChart);

var uniVariateChart = document.getElementById('uniVariateChart');
var biVariateChart = document.getElementById('biVariateChart');

function makeChart(data){
  dataset = data;

  dataset.columns = ["", "Date", "Country", "Local", "Industry_Sector", "Accident_Level", "Potential_Accident_Level", "Gender", "Employee_Type", "Critical_Risk", "Description"];
  renameKeys(dataset);

  for (var i=0; i<dataset.columns.length; i++){
    if(dataset.columns[i] != "" && dataset.columns[i] !="Date" && dataset.columns[i] != "Description"){
      [unique_val, counts] = getValueCounts(dataset, dataset.columns[i]);
      key = dataset.columns[i];
      value_counts_dict[key] = [unique_val, counts];
    }
  }
  
  pot_acc_levels = value_counts_dict["Potential_Accident_Level"][0];
  countries = value_counts_dict["Country"][0];
  locals = value_counts_dict["Local"][0];
  ind_sectors = value_counts_dict["Industry_Sector"][0];
  acc_levels = value_counts_dict["Accident_Level"][0];
  genders = value_counts_dict["Gender"][0];
  emp_types = value_counts_dict["Employee_Type"][0];
  critical_risks = value_counts_dict["Critical_Risk"][0];

  pot_acc_levels.sort()
  acc_levels.sort()

  uniques_dict = {
    "Country" : countries, 
    "Local": locals,
    "Industry_Sector": ind_sectors, 
    "Accident_Level": acc_levels, 
    "Potential_Accident_Level": pot_acc_levels, 
    "Gender": genders, 
    "Employee_Type": emp_types, 
    "Critical_Risk":  critical_risks
  }

  univariate();
}


function univariate(){
  isUnivariate = true;
  col = $("#heading")[0].innerText;
  col = col.replaceAll(" ", "_");
  promise.then(makeUniVariateChart);  
  document.getElementById("bivariate_insights").style.display = "none";
  document.getElementById("univariate_insights").style.display = "block";
  
  insights = $(".insights");   
  for (var i=0; i < insights.length; i++) {
    insights[i].style.display = 'none';
  } 

  $("#univariate_insights #" + col)[0].style.display = "block";
}

function bivariate(){
  isUnivariate = false;
  col = $("#heading")[0].innerText;
  col = col.replaceAll(" ", "_");
  promise.then(makeBiVariateChart);
  document.getElementById("univariate_insights").style.display = "none";
  document.getElementById("bivariate_insights").style.display = "block";

  insights = $(".insights");   
  for (var i=0; i < insights.length; i++) {
    insights[i].style.display = 'none';
  } 
  
  $("#bivariate_insights #" + col)[0].style.display = "block";
}

$(document).on('click', '#sidebarMenu .nav-link', function (event) { 
  col = event.target.innerText;
  $("#heading")[0].innerText = col;
  if(isUnivariate == true){
    univariate();
  } else{
    bivariate();
  }
});

function renameKeys(dataset) { 
  dataset = dataset.map(function(obj) {
      obj['Country'] = obj['Countries']; 
      delete obj['Countries']; 

      obj['Industry_Sector'] = obj['Industry Sector'];
      delete obj['Industry Sector']; 

      obj['Accident_Level'] = obj['Accident Level'];
      delete obj['Accident Level']; 

      obj['Gender'] = obj['Genre'];
      delete obj['Genre']; 

      obj['Employee_Type'] = obj['Employee or Third Party'];
      delete obj['Employee or Third Party']; 

      obj['Critical_Risk'] = obj['Critical Risk'];
      delete obj['Critical Risk'];
      
      obj['Potential_Accident_Level'] = obj['Potential Accident Level'];
      delete obj['Potential Accident Level'];

      return obj;
  });
}

function getValueCounts(data, col){
  var values = data.map(function(d) {
    return d[col];
  });

  const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
  count = countOccurrences(values);

  labels = Object.keys(count)
  data = Object.values(count)
  
  return [labels, data];
}

function getAccLevelByCol(data, col, values, pot_acc_level){
  count = [];
  dict = [];

  for (var i=0; i<values.length; i++){
    var filteredData = data.filter(function(d)
    { 
      if( d[col] == values[i] && d["Potential_Accident_Level"] == pot_acc_level)
      { 
        return d;
      } 
    })
    count[values[i]] = filteredData.length;
  }

  return count;
}

function makeUniVariateChart(dataset){
  uniVariateChart.style.display = "block";
  biVariateChart.style.display = "none";
  
  if(chart){
    chart.destroy();
  }
  
  col = document.getElementById("heading");
  label = col.innerText;
  col_name = col.innerText.replaceAll(" ", "_")

  chart = new Chart(uniVariateChart, {
    type: "bar",
    options:{
      plugins: {
        colorschemes: {  
          scheme: 'office.Parallax6'
        }  
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: false,
            labelString: ''
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'count'
          }
        }]
      }     
    },
    data: {
      labels: value_counts_dict[col_name][0],
      datasets: [
        {
          label: label,
          data: value_counts_dict[col_name][1]
        }
      ]
    }
  });
    
}

function makeBiVariateChart(dataset) {
  uniVariateChart.style.display = "none";
  biVariateChart.style.display = "block";

  col = document.getElementById("heading");
  label = col.innerText;
  col_name = col.innerText.replaceAll(" ", "_")

  pot_acc_by_col_dict = [];
  for (var i=0; i<pot_acc_levels.length; i++){
    pot_acc_by_col_dict[pot_acc_levels[i]] = getAccLevelByCol(dataset, col_name, uniques_dict[col_name], pot_acc_levels[i]);    
  }

  datapoints = []

  for(var i=0; i<pot_acc_levels.length; i++){
    datapoints.push(
      {
        label: pot_acc_levels[i],
        data: Object.values(pot_acc_by_col_dict[pot_acc_levels[i]])                    
      }
    )
  }

  if(bichart){
    bichart.destroy();
  }

  bichart = new Chart(biVariateChart, {
    type: "bar",
    options: {
      legend: {
        display: true
      },
      plugins: {
        colorschemes: {  
          scheme: 'office.Parallax6'
        }  
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: label
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'count'
          }
        }]
      }     
    },
    data: {
      labels: value_counts_dict[col_name][0],
      datasets: datapoints
    }
  });

}
  


    