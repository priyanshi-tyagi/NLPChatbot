$(document).ready(function(){
	
	$(".chat_on").click(function(){
        $(".Layout").toggle();
        $(".chat_on").hide(300);
    });
    
       $(".chat_close_icon").click(function(){
        $(".Layout").hide();
           $(".chat_on").show(300);
    });

	data = document.getElementById("data").innerText;
	unique_data = JSON.parse(data);
	
	cols = Object.keys(unique_data);	
	cols.splice(3,1);
	cols.push("Accident_Level");
	cols.push("Description");

	questions = Object.keys(unique_data);	
	questions.splice(3,1);
	questions.push("Accident_Level");
	questions.push("Description");

	for(var i = 0; i<questions.length; i++){
		questions[i] = questions[i].replace("_", " ");
	}

	prefix_ques = [
		"Please select a ", 
		"Please select a ", 
		"Please select an ", 
		"Please select a ", 
		"Please select an ", 
		"Please select/enter a ",
		"Please select an ",
		"Please enter a "]

	var mainDiv = document.getElementById("main");

	div = createResponseDiv("Hi!! This Indie. I can help you to predict the potential accident level for your industrial activity!!");
	sub = createSub();
	div.appendChild(sub);

	div = createResponseDiv(prefix_ques[0] + questions[0], 0);
	createOptions(cols[0], unique_data[cols[0]], div);
	sub = createSub();
	div.appendChild(sub);

	function getTime(){
		var d = new Date();
		if(d.getHours() < 12){
			hrs = d.getHours();
			text = "AM";
		} else{
			hrs = d.getHours() - 12;
			text = "PM";
		}

		return hrs + ":" + d.getMinutes() + text;
	}

	function createSub(){
		//time
		var sub = document.createElement("sub");
		time = getTime();

		sub.innerHTML += time;

		return sub;
	}

	function createPara(text){
		//text
		var para = document.createElement("p");
		var node = document.createTextNode(text);	
		para.appendChild(node);

		return para;
	}

	function createRequestDiv(i, text){
		para = createPara(text);
		
		var div = document.createElement("div");
		div.classList.add("msg");
		div.classList.add("ms-md-auto");
		div.setAttribute("id", cols[i]);
		div.appendChild(para);

		mainDiv.appendChild(div);
		mainDiv.scrollTop = mainDiv.scrollHeight;

		return div;
	}

	function createResponseDiv(text, i=undefined){
		para = createPara(text);

		var div = document.createElement("div");
		div.classList.add("msg");
		div.classList.add("reply");
		if(i != undefined){
			div.setAttribute("id", cols[i] + "_text");
		}

		div.appendChild(para);

		mainDiv.appendChild(div);
		mainDiv.scrollTop = mainDiv.scrollHeight;

		return div;

	}

	function createOptions(key, values, div) {
		for (var i= 0; i< values.length; i++) {
			para = document.createElement("p");
			radio = document.createElement("input");
			label = document.createElement("label")
			//br = document.createElement("br");

			para.setAttribute("class", "option");

			radio.setAttribute("type", "radio");
			radio.setAttribute("name", key)
			radio.setAttribute("value", values[i]);
			radio.setAttribute("class", "radio");

			label.setAttribute("for", values[i]);			
			label.innerText = values[i];
						
			para.appendChild(radio);
			para.appendChild(label);
			div.appendChild(para);
			//div.appendChild(br);
		}


	}

	function createTextArea(text){
		textarea = document.createElement("textarea");
		textarea.setAttribute("class", text);
		textarea.setAttribute("placeholder", "Please enter a " + text);
		return textarea;
	}

	function clearText(){
		document.getElementById("request").value = "";
	}

	$("#request").on('keypress',function(e) {		
		if(e.which == 13) {
			e.preventDefault();
			$("#send").click();
		}
	});

	var i = 0;
	function askNextInput(event){
		if(event.target.tagName == "TEXTAREA"){
			value = event.target.value;					
		} else if (event.target.tagName == "INPUT"){
			value = event.target.parentElement.children[1].innerText;		
		}
		
		obj = document.getElementById(cols[i] + "_text");
		obj.remove();
		
		div = createResponseDiv(prefix_ques[i] + questions[i], i);
		sub = createSub();
		div.appendChild(sub);
		
		div = createRequestDiv(i, value);
		sub = createSub();
		div.appendChild(sub);

		if(i < cols.length - 1){
			div = createResponseDiv(prefix_ques[i + 1] + questions[i + 1], i+1);
			if (cols[i + 1] == "Critical_Risk"){
				createOptions(cols[i + 1], unique_data[cols[i + 1]], div);
				textarea = createTextArea("Critical Risk");
				div.appendChild(textarea);
				br = document.createElement("br");
				div.appendChild(br);
				div.appendChild(br);
				sub = createSub();
				div.appendChild(sub);
			}
			else if (cols[i + 1] == "Description"){
				textarea = createTextArea("Description");
				div.appendChild(textarea);
				br = document.createElement("br");
				div.appendChild(br);
				div.appendChild(br);
				sub = createSub();
				div.appendChild(sub);
			} else{
				createOptions(cols[i + 1], unique_data[cols[i + 1]], div);
				sub = createSub();
				div.appendChild(sub);
			}
		}

		if(i == cols.length - 1){
			//document.getElementById("send").disabled = true;
			//document.getElementById("request").disabled = true;
			$("form").submit();
		}

		i += 1;
	}

	$(document).on( 'click', 'input', function (event) { 
		askNextInput(event);
	});

	$(document).on( 'keypress', 'textarea', function (event) {		
		if(event.which == 13) {
			event.preventDefault();
			askNextInput(event);
		}
	});
				
	$("form").submit(function(event){
		event.preventDefault();

		country = $('#Country p')[0].innerText;
		local = $('#Local p')[0].innerText;
		industry_sector = $('#Industry_Sector p')[0].innerText;
		gender = $('#Gender p')[0].innerText;
		employee_type = $('#Employee_Type p')[0].innerText;
		critical_risk = $('#Critical_Risk p')[0].innerText;
		accident_level = $('#Accident_Level p')[0].innerText;
		description = $('#Description p')[0].innerText;
						
		$.ajax({
            url: "/chatbot/",
			enctype: 'multipart/form-data',
            data: {
				'country' : country,
				'local' : local,
				'industry_sector' : industry_sector,
				'gender' : gender,
				'employee_type' : employee_type,
				'critical_risk' : critical_risk,
				'accident_level' : accident_level,
				'description' : description
            },
            success: function(response){
				clearText()		
				div = createResponseDiv("Potential accident level is: " + response.prediction);
				sub = createSub();
				div.appendChild(sub);
				
				if(response.prediction == "I"){
					div = createResponseDiv("Hurray! You are at a very lower level of Accidental risk, however you are requested to follow all the safety rules while performing your Job. Thanks for availing this service!");
				} else if(response.prediction == "II"){
					div = createResponseDiv("Accidental risk is less in this Level, however you are requested to follow all the safety rules while performing your Job. Thanks for availing this service!");
				} else if(response.prediction == "III"){
					div = createResponseDiv("Though the risk is not much severe, but it is moderate in nature. Please follow all the safety rules while performing your Job. Thanks for availing this service!");
				} else if (response.prediction == "IV"){
					div = createResponseDiv("Thanks for availing my quick response services. Please take care and follow all the safety precautions !");
				} else{
					div = createResponseDiv("Life fatalities risk is more in this Level. Please take proper precaution and follow all the safety rule while performing your Job. Thanks for availing this service !");
				}

				sub = createSub();
				div.appendChild(sub);

            },
			error: function(error){
				console.log(error)
			}
        });

				
	});
 
});