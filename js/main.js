// Initial setup of the page
$(document).ready(function(){
	$("#selectOptions").html(createOptions());
});

// Calculate the results
$("#btnCalculate").click(function(){
	var sloc = parseInt($("#inputFp").val())*
});

// Values from: http://www.qsm.com/resources/function-point-languages-table
function createOptions(){
	var options = [
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
	var optionStr="<select class='form-control'>";
	
	for(var i=0;i<options.length;i++){
		optionStr+="<option value="+options[i].value+">"+options[i].name+"</option>";
	}
	
	optionStr+="</select>";
	return optionStr;
}
