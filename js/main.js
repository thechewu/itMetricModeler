// Global vars
var options;

// Initial setup of the page
$(document).ready(function(){
	initVariables();
	$("#selectOptions").html(createOptions());
	$("#langSelect").val(100).change();
	$("#effortSlider").slider({
		min:20,
		max:100,
		value:100,
		animate:"fast",
		step:10
	});
	$("#complexitySlider").slider({
		min:1,
		max:10,
		value:5,
		animate:"fast"
	});
	// Calculate the results
	$("#btnCalculate").click(function(){
		// Variables for the calculation
		var sloc = parseInt($("#inputFp").val())*parseInt($("#langSelect").val());
		var effort = $( "#effortSlider" ).slider( "value" )/100;
		var complexity = 1+(($( "#complexitySlider" ).slider( "value" )*0.024));
		var teamCongruity = 1.05-parseInt($("#teamCongruity").val())*0.02;
		var langExperience = 1.26 - parseInt($("#langExperience").val())*0.07;
		var platformExperience = 1.25 - parseInt($("#platformExperience").val())*0.08; 
		var testing = parseInt($("#testingSelect").val());
		var programCap = 1.46 - parseInt($("#programerCap").val())*0.145; 
		var myNewVariable;
		// Constant has gone up from 1998 and this reflects the change
		var personMonth = 2.7 * effort * Math.pow((sloc/1000),complexity) * langExperience * platformExperience * teamCongruity *programCap*(0.85+0.05*testing);
		var cost = personMonth * parseInt($("#inCpp").val());
		var coefficient = (3+(Math.log(sloc)/Math.LN10)/10)/10;
		var schedule = 3.5 * Math.pow(personMonth,coefficient);
		if(isNaN(personMonth)){
			alert("Please enter valid values.");
			return;
		}
		$("#personMonth").html(Math.round(personMonth*10)/10);
		$("#totalCost").html("$"+Math.round(cost));
		$("#schedule").html((Math.round(schedule*10)/10)+" Months ");
		$("#slocEst").html(Math.round(sloc));
		// http://www.softwaremetrics.com/Articles/defects.htm
		$("#maximumBugs").html(Math.round(parseInt($("#inputFp").val())*(1.4-(0.2*testing))));
		$("#teamSize").html(Math.round(personMonth/schedule));
		$("#docEst").html(Math.round(parseInt($("#inputFp").val())/5)+" Pages");
		$("#results").fadeIn(400);
	});
	$("#btnExport").click(function(){

		var lang = $("#langSelect").prop("selectedIndex");
		var eff = $("#effortSlider").slider("value");
		var comp = $("#complexitySlider").slider("value");
		var outStr = $("#mmform").serialize()+"&langSelect="+lang+"&effort="+eff+"&complexity="+comp;
		window.location="export.php?"+outStr;
	});
	$(":file").change(function(){
		var file = this.files[0];
		var name = file.name;
		if(name.indexOf(".txt")===-1){
			alert("Please upload a .txt or .csv file.");
			return;
		}
		var size = file.size;
		var type = file.type;
	});
	$("#btnUpload").click(function(){
		var formData = new FormData($("#uploadform")[0]);
		formData.append('file',$("#file")[0].files[0]);

		$.ajax({
			url:"import.php",
			type: "POST",
			xhr: function(){return $.ajaxSettings.xhr()},
			success: function(data){
				importValues(data);
				
			},
			error:function(data){
				console.log("Error occurred: "+data);
			},
			data:formData,
			cache:false,
			contentType:false,
			processData:false,
		});
	});
	$("#dismissResults").click(function(){
		$("#results").fadeOut(200);
	});
	$("#btnCloseAlert").click(function(){
		$("#successInfo").fadeOut(100);
	});
	$("#about").click(function(){
		$("#aboutPage").fadeIn(200);
	});
	$("#aboutPage").click(function(){
		$("#aboutPage").fadeOut(200);
	});
});

function importValues(data){
	var data = $.parseJSON(data);
	for(var i=0;i<data.length;i++){
		switch(data[i][0]){
			
			case "langSelect":
				$("#langSelect :nth-child("+(parseInt(data[i][1])+1)+")").prop("selected",true);
				break;			
			case "effort":
				$("#effortSlider").slider("option","value",data[i][1]);
				break;
			case "complexity":
				$("#complexitySlider").slider("option","value",data[i][1]);
				break;
			default:
				$("#"+data[i][0]).val(data[i][1]);
				break;	
		}
	}
	$("#successInfo").fadeIn(100);
}

// Values from: http://www.qsm.com/resources/function-point-languages-table
function createOptions(){
	var optionStr="<select class='form-control' name='langSelect' id='langSelect'>";
	for(var i=0;i<options.length;i++){
		optionStr+="<option value="+options[i].value+">"+options[i].name+"</option>";
	}
	optionStr+="</select>";
	return optionStr;
}

function getOption(name){
	for(var i=0;i<options.length;i++){
		if(options[i].name === name){
			return options[i].value;
		}
	}
	return null;
}

function initVariables(){
	options = [
		{name:'ASP',value:51},
		{name:'Assembler',value:119},
		{name:'C',value:100},
		{name:'C++',value:50},
		{name:'C#',value:54},
		{name:'COBOL',value:61},
		{name:'HTML',value:61},
		{name:'Java',value:53},
		{name:'JavaScript',value:47},
		{name:'.NET',value:57},
		{name:'Oracle',value:37},
		{name:'PERL',value:24},
		{name:'SQL',value:21},
		{name:'VB .NET',value:52},
		{name:'Visual Basic',value:42},
	];
}