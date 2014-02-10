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
		animate:"fast"
	});
	$("#complexitySlider").slider({
		min:1,
		max:10,
		value:5,
		animate:"fast"
	});
	// Calculate the results
	$("#btnCalculate").click(function(){
		var sloc = parseInt($("#inputFp").val())*parseInt($("#langSelect").val());
		var effort = $( "#effortSlider" ).slider( "value" )/100;
		var complexity = 1+(($( "#complexitySlider" ).slider( "value" )*0.024));
		// Constant has gone up from 1998 and this reflects the change
		var personMonth = 3 * effort * Math.pow((sloc/1000),complexity);
		var cost = personMonth * parseInt($("#inCpp").val());
		var coefficient = (3+(Math.log(sloc)/Math.LN10)/10)/10;
		var schedule = 3.2 * Math.pow(personMonth,coefficient);
		
		
		$("#personMonth").html(Math.round(personMonth*10)/10);
		$("#totalCost").html("$"+Math.round(cost));
		$("#schedule").html((Math.round(schedule*10)/10)+" Months ");
		$("#slocEst").html(Math.round(sloc));
		$("#results").show();
	});
	$("#btnExport").click(function(){
		var fp = $("#inputFp").val();
		var lang = $("#langSelect").prop("selectedIndex");
		var cpp = $("#inCpp").val();
		var eff = $("#effortSlider").slider("value");
		var comp = $("#complexitySlider").slider("value");
		window.location="export.php?functionPoints="+fp+"&langIndex="+lang+"&costPerPerson="+cpp+"&effort="+eff+"&complexity="+comp;
	});
	$(":file").change(function(){
		var file = this.files[0];
		var name = file.name;
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

});

function importValues(data){
	var data = $.parseJSON(data);
	for(var i=0;i<data.length;i++){
		switch(data[i][0]){
			case "functionPoints":
				$("#inputFp").val(data[i][1]);
				break;
			case "costPerPerson":
				$("#inCpp").val(data[i][1]);
				break;
			case "langIndex":
				$("#langSelect :nth-child("+parseInt(data[i][1])+")").prop("selected",true);
				break;			
			case "effort":
				$("#effortSlider").slider("option","value",data[i][1]);
				break;
			case "complexity":
				$("#complexitySlider").slider("option","value",data[i][1]);
				break;
		}
	}
}

// Values from: http://www.qsm.com/resources/function-point-languages-table
function createOptions(){
	var optionStr="<select class='form-control' id='langSelect'>";
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
