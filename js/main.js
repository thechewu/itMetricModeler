// Global vars
var options;
var projects = new Array();
var dataSet1;
var dataSet2;
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

	// Acquisition Phase Distribution

		// Effort(PM) = 1.18 * CalculatedEffortResult * EffortFactor
		// Schedule(M) = 1.25 * CalculatedScheduleMonths * ScheduleFactor
		// Staff = Effort / Schedule
		// Cost = Schedule * Staff

		// Factor chart		Effort(PM)	Schedule(M)
		// Inception		0.05		0.10
		// Elaboration		0.20		0.30
		// Construction		0.65		0.50
		// Transition		0.10		0.10

		// put all effort and schedule factors into arrays
		var EffortFactor = [5,20,65,10];
		var ScheduleFactor = [10,30,50,10];
		var apdEffort = new Array();
		var apdSchedule = new Array();
		var apdStaff = new Array();
		var apdCost = new Array();

		for(var x=0;x<4;x++){
			var idInception = "#effort" + x.toString();
			apdEffort[x] = Math.round(1.18 * personMonth * EffortFactor[x]/10)/10;
			$(idInception).html(apdEffort[x]);
			var idSchedule = "#schedule" + x.toString();
			apdSchedule[x] = Math.round(1.25 * schedule * ScheduleFactor[x]/10)/10;
			$(idSchedule).html(apdSchedule[x]);
			var idStaff = "#staff" + x.toString();
			apdStaff[x] = Math.round(apdEffort[x] / apdSchedule[x]*10)/10;
			$(idStaff).html(apdStaff[x]);
			var idCost = "#cost" + x.toString();
			apdCost[x] = Math.round(apdSchedule[x] * apdStaff[x] * ($("#inCpp").val()));
			$(idCost).html(apdCost[x]);
		}

		// grand totals for each column
		var apdTotals = [0,0,0,0];
		for(var x=0;x<4;x++) {
			apdTotals[0] += apdEffort[x];
			apdTotals[1] += apdSchedule[x];
			apdTotals[2] += apdStaff[x];
			apdTotals[3] += apdCost[x];
		}
		// display subtotals
		$("#apdTotal0").html(Math.round(apdTotals[0]*10)/10);
		$("#apdTotal1").html(Math.round(apdTotals[1]*10)/10);
		$("#apdTotal2").html(Math.round(apdTotals[2]*10)/10);
		$("#apdTotal3").html(Math.round(apdTotals[3]*10)/10);

		// round apdSchedule[] to even months

		/*
		// Google Chart API
		google.load("visualization", "1", {packages:["corechart"]});
      	google.setOnLoadCallback(drawChart);

      	function drawChart() {
	        var chartdata = google.visualization.arrayToDataTable([
	          ['Year', 'Sales', 'Expenses'],
	          ['2004',  1000,      400],
	          ['2005',  1170,      460],
	          ['2006',  660,       1120],
	          ['2007',  1030,      540]
	        ]);

	        var chartoptions = {
	          title: 'Acquisition Phase Distribution',
	          vAxis: {title: 'Months',  titleTextStyle: {color: 'white'}}
	        };

	        var chart = new google.visualization.ColumnChart(document.getElementById('theChart'));
	        chart.draw(chartdata, chartoptions);
      	}
      	*/

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
	
	$("#btnLoadProj").click(function(){
		var selectedProj = $("#selectProject option:selected").text();
		var projectStart;		
		
		for(var i=0; i<projects.length; i+=12){
			if(selectedProj == projects[i][1]){
				projectStart = i;
			}
		}
		
		var projectEnd = projectStart+12;
		
		while(projectStart < projectEnd){
			switch(projects[projectStart][0]){
				case "langSelect":
					$("#langSelect :nth-child("+(parseInt(projects[projectStart][1])+1)+")").prop("selected",true);
					break;		
					
				case "effort":
					$("#effortSlider").slider("option","value",projects[projectStart][1]);
					break;
					
				case "complexity":
					$("#complexitySlider").slider("option","value",projects[projectStart][1]);
					break;
			
				default:
					$("#"+projects[projectStart][0]).val(projects[projectStart][1]);
					break;
			}

			projectStart++;
		}		
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
	//User click on Import to retrieve first file's contents
	//On success, second Import button will be triggered and ready for import
	//and a success message will appear.
	//Both sets of data are then passed into function drawChart.

	$("#btnUpload1").click(function(){
		var formData = new FormData($("#uploadform1")[0]);
		formData.append('file',$("#file1")[0].files[0]);
		
		$.ajax({
			url:"import.php",
			type: "POST",
			xhr: function(){return $.ajaxSettings.xhr()},
			success: function(data){
				dataSet1 = data;
				$("#btnUpload2").trigger("click");
				$("#successChartInfo").fadeIn(500);
			},
			error:function(data){
				console.log("Error occurred: "+data);
			},
			data:formData,
			cache:false,
			contentType:false,
			processData:false,
			async: false
		});
			$("#btnUpload2").click(function(){
			console.log("boo");
			var formData2 = new FormData($("#uploadform2")[0]);
			formData2.append('file',$("#file2")[0].files[0]);
			$.ajax({
				url:"import.php",
				type: "POST",
				xhr: function(){return $.ajaxSettings.xhr()},
				success: function(data){
					dataSet2 = data;
					$("#successChartInfo").fadeIn(100);
				},
				error:function(data){
					console.log("Error occurred: "+data);
				},
				data:formData2,
				cache:false,
				contentType:false,
				processData:false,
				async: false
			});
		});
		
		drawChart(dataSet1, dataSet2);
	});
	$("#dismissResults").click(function(){
		$("#results").fadeOut(200);
	});
	$("#dismisscharts").click(function(){
		$("#chartshow").fadeOut(200);
	});
	$("#dismissChartResults").click(function(){
		$("#compareGraph").fadeOut(200);
	});
	$("#btnCloseAlert").click(function(){
		$("#successInfo").fadeOut(100);
	});
	$("#btnCloseChartAlert").click(function(){
		$("#successChartInfo").fadeOut(100);
	});
	$("#about").click(function(){
		$("#aboutPage").fadeIn(200);
	});
	$("#aboutPage").click(function(){
		$("#aboutPage").fadeOut(200);
	});
	$("#btnCompareData").click(function() {
		//alert('Hello');
		$("#compareGraph").fadeIn(100);
	});
	$("#compareChartHelp").click(function(){
		$("#compareChartInfo").fadeIn(200);
	});
	$("#compareChartInfo").click(function(){
		$("#compareChartInfo").fadeOut(200);
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

		projects.push(data[i]);		
	}
	$("#successInfo").fadeIn(100);	
	
	populateSelect();	
	
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
//populate the selectbox with uploaded projects
function populateSelect(){
	for(var i=0; i<projects.length; i+=12){
		if($("#selectProject option[value='"+projects[i][1]+"']").length == 0){
			$('#selectProject').append("<option value="+projects[i][1]+">"+projects[i][1]+"</option>");
		}
	}		
	$("#selectProject").show();
}
//Load the Google Visualization API and the chart package.
google.load("visualization", "1", {packages:["corechart"]});

//Function drawChart takes in imported files data and parse them into javascript arrays 
//be used in datatable creation.
function drawChart(data1, data2) {
	console.log("is it here");
	var data1 = $.parseJSON(data1);
	var data2 = $.parseJSON(data2);
	//Array element for functional points is cut down by three decimal points
	//if it is greater than 1000. This displays the data better.
	if (data1[1][1] >= 1000) {
		data1[1][0] = "inputFp (thousands)";
		data1[1][1] = (data1[1][1]/1000);
	}
	if (data2[1][1] >= 1000) {
		data2[1][0] = "inputFp (thousands)";
		data2[1][1] = (data2[1][1]/1000);
	}	
	//Create datatable using data
	var dataSet1 = google.visualization.arrayToDataTable(data1);
	var dataSet2 = google.visualization.arrayToDataTable(data2);
	//Instantiate and draws chart into div tag.
	var barChartDiff = new google.visualization.ColumnChart($('#compareChart')[0]);
	//Set options
	var options = {width: 1000, height: 500, title: "Historical Project Data Comparison"};
	//Draw diff chart
	var diffData = barChartDiff.computeDiff(dataSet1, dataSet2);
	barChartDiff.draw(diffData, options);
};