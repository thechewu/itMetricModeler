// Variable declaration
// Language select sptions
var options;

// Array of all uploaded projects
var projects = new Array();

// Array for keeping filenames
var fileNames = new Array();

// Used to store calculated results, used for comparison.
var calculations = new Array();

// Enum for different types of Ajax calls
AjaxCall={
	Import : 0,
	Compare1 : 1,
	Compare2 : 2,
}

// Loads Google Chart API
google.load("visualization", "1", {packages:["corechart"]});

// Initial setup of the page
$(document).ready(function(){
	initVariables();
	$("#selectOptions").html(createOptions());
	// Set the language to C by default
	$("#langSelect").val(97).change();
	// Create effort slider
	$("#effortSlider").slider({
		min:20,
		max:100,
		value:100,
		animate:"fast",
		step:10
	});
	// Create complexity slider
	$("#complexitySlider").slider({
		min:1,
		max:10,
		value:5,
		animate:"fast"
	});
	
	// Calculate the results
	$("#btnCalculate").click(function(){
		if(!validate()){
			return;
		}
		var projectName = $("#projectName").val();
		var fPoints =  parseInt($("#inputFp").val());
		var langSelect = parseInt($("#langSelect").val());
		var wage = parseInt($("#inCpp").val());
		// Calculate the input variables.
		var sloc = fPoints*langSelect; // Source lines of code
		var effort = $( "#effortSlider" ).slider( "value" )/100; // Team effort
		var complexity = 1+(($( "#complexitySlider" ).slider( "value" )*0.024)); // Complexity of the project
		var teamCongruity = 1.05-parseInt($("#teamCongruity").val())*0.02;  // Team congruity
		var langExperience = 1.26 - parseInt($("#langExperience").val())*0.07; // Programmer language experience
		var platformExperience = 1.25 - parseInt($("#platformExperience").val())*0.08; // Programmer platform experience
		var testing = parseInt($("#testingSelect").val()); // Project testing modifier
		var programCap = 1.46 - parseInt($("#programerCap").val())*0.145; // Programmer capability
		
		
		// Calculate the output variables.
		var personMonth = 2.7 * effort * Math.pow((sloc/1000),complexity) * langExperience * platformExperience * teamCongruity *programCap*(0.85+0.05*testing);
			personMonth = Math.round(personMonth*10)/10;
		var cost = Math.round(personMonth * wage);
		var coefficient = (3+(Math.log(sloc)/Math.LN10)/10)/10;
		var schedule = 3.5 * Math.pow(personMonth,coefficient);
			schedule = (Math.round(schedule*10)/10);
		sloc = Math.round(sloc);
		var maximumBugs = Math.round(fPoints*(1.4-(0.2*testing)));
		var teamSize = Math.ceil(personMonth/schedule)
		var docEst = Math.round(fPoints/3);
		

		// Store all calculations in an array (for reuse in comparison feature)
		calculations[projectName] = new Array();
		calculations[projectName][0] = new Array("Project Name",projectName);
		calculations[projectName][1] = new Array("Person Months",personMonth);
		calculations[projectName][2] = new Array("Cost(Thousands)",cost);
		calculations[projectName][3] = new Array("Schedule",schedule);
		calculations[projectName][4] = new Array("SLOC(Thousands)",sloc);
		calculations[projectName][5] = new Array("Bugs",maximumBugs);
		calculations[projectName][6] = new Array("Staff",teamSize);
		calculations[projectName][7] = new Array("Documentation",docEst);
		populateCompareSelect();
		
		// Display Data
		$("#personMonth").html(personMonth);
		$("#totalCost").html("$"+cost);
		$("#schedule").html(schedule+" Months ");
		$("#slocEst").html(sloc);
		$("#maximumBugs").html(maximumBugs);// http://www.softwaremetrics.com/Articles/defects.htm
		$("#teamSize").html(teamSize);
		$("#docEst").html(docEst+" Pages");
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
		// var scheduleLen = [0,0,0,0];
		for(var x=0;x<4;x++) {
			apdTotals[0] += apdEffort[x];
			apdTotals[1] += apdSchedule[x];
			// scheduleLen[x] = (Math.floor(apdTotals[1])*10);  if using stacked chart
			apdTotals[2] += apdStaff[x];
			apdTotals[3] += apdCost[x];
		}
		// display subtotals
		$("#apdTotal0").html(Math.round(apdTotals[0]*10)/10); // total inception
		$("#apdTotal1").html(Math.round(apdTotals[1]*10)/10); // total schedule
		$("#apdTotal2").html(Math.round(apdTotals[2]*10)/10); // total staff
		$("#apdTotal3").html(Math.round(apdTotals[3]*10)/10); // total cost

		// build charting array
		var chartArray = [];
		var chartElements = [];
		var phaseCount = 0, actMonth = 1;
		chartElements[0] = ['Months', 'Inception', 'Elaboration', 'Construction', 'Transition'];

		for(var phaseCount=0; phaseCount<apdSchedule.length; phaseCount++) {
			var ince=0, elab=0, cons=0, tran=0;
			switch (phaseCount) {
					case 0:
						ince=apdStaff[0];
						break;
					case 1:
						elab=apdStaff[1];
						break;
					case 2:
						cons=apdStaff[2];
						break;
					case 3:
						tran=apdStaff[3];
						break;
				}
		var maxPhaseMonth = Math.floor(apdSchedule[phaseCount]);
			if(maxPhaseMonth<1)
				maxPhaseMonth=1;
			for(var nMonth=1; nMonth <= maxPhaseMonth; nMonth++) {
				chartElements[actMonth] = [actMonth, ince, elab, cons, tran];
				actMonth++;
			}	
		}


		/* below is the amazing stacked bar chart so partial schedule is taken account for but not correct

		// this will count up to 10 times the total number of months so 1.8 months will be 18 mCount
		// step through total scheduled time x 10; if total = 18.2 month; 182 is max iteration
		var staffCount = 0, monthNum=1, ince=0, elab=0, cons=0, tran=0;
		for(var mCount = 1; mCount<=(apdTotals[1]*10); mCount++) {
			// following statemnet checks if transition from one phase to next
			// example: Inception to Elaboration in table
			if(scheduleLen[staffCount]==mCount) {
				switch (staffCount) {
					case 0:
						ince=(mCount%10)*0.10*apdStaff[0];
						break;
					case 1:
						elab=(mCount%10)*0.10*apdStaff[1];
						break;
					case 2:
						cons=(mCount%10)*0.10*apdStaff[2];
						break;
					case 3:
						tran=(mCount%10)*0.10*apdStaff[3];
						break;
				}
				staffCount++;
			}
			// every 10 mCounts == 1 month
			if(mCount%10==0) {
				switch (staffCount) {
					case 0:
						ince=apdStaff[0];
						break;
					case 1:
						elab=apdStaff[1]-ince;
						break;
					case 2:
						cons=apdStaff[2]-elab;
						break;
					case 3:
						tran=apdStaff[3]-cons;
						break;
				}
				// create array
				chartElements[monthNum] = [monthNum, ince, elab, cons, tran];
				monthNum++;
				//reset all phase vars
				ince=0;
				elab=0;
				cons=0;
				tran=0;
			}
		}
		// final month calculation
		chartElements[monthNum] = [monthNum, ince, elab, cons, tran];
		*/
		chartArray = chartElements;

		// Google Chart API
      	drawAPDChart(chartArray);

	}); // end button calculate

	// Exports the current form input as .txt file.
	$("#btnExport").click(function(){
		var lang = $("#langSelect").prop("selectedIndex");
		var eff = $("#effortSlider").slider("value");
		var comp = $("#complexitySlider").slider("value");
		var outStr = $("#mmform").serialize()+"&langSelect="+lang+"&effort="+eff+"&complexity="+comp;
		window.location="export.php?"+outStr;
	});

	// File validation and storing.
	$(":file").change(function(){
		var file = this.files[0];
		var name = file.name;
		if(name.indexOf(".txt")===-1 && name.indexOf(".csv")===-1 && name.indexOf(".json")===-1){
			showError("Please upload a .txt, .csv, or .json file.");
			return;
		}
		var size = file.size;
		var type = file.type;
		var formData = new FormData($("#uploadform")[0]);
		formData.append('file',$("#file")[0].files[0]);
		// Add project formdata to the array, and filename to fileNames array.
		projects.push(formData);
		fileNames.push(name);
		populateSelect();
	});

	// File upload via ajax.
	$("#btnUpload").click(function(){
		var selection = parseInt($("#selectProject").val());
		if(isNaN(selection)){
			showError("Please select a file to load.");
			return;
		}
		var formData = projects[selection];
		doAjax(formData,AjaxCall.Import);
	});
	
	// Compares two selected sets of data.
	$("#btnCompare").click(function(){
		var file1 = $("#fileCompare1").val();
		var file2 = $("#fileCompare2").val();
		if(file1 == null || file2 == null){
			showError("Please select files to compare.");
			return;
		}
		if(file1 == file2){
			showError("Cannot compare a project to itself.");
			return;
		}
		drawChart(file1,file2);
	});
	//////////////////////////////////////////////////////////////////////////
	// Following methods are close button handlers for alerts and sections. //
	//////////////////////////////////////////////////////////////////////////
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
	
	$("#btnCloseErrorAlert").click(function(){
		$("#errorInfo").fadeOut(100);
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
		$("#compareGraph").fadeIn(100);
	});

	$("#compareChartHelp").click(function(){
		$("#compareChartInfo").fadeIn(200);
	});

	$("#compareChartInfo").click(function(){
		$("#compareChartInfo").fadeOut(200);
	});

});

// Performs the specified ajax call with passed in form data.
function doAjax(formData,ajaxCall){
	$.ajax({
			url:"import.php",
			type: "POST",
			xhr: function(){return $.ajaxSettings.xhr()},
			success: function(data){
				switch(ajaxCall){
					// Loads the data from the file to the form.
					case AjaxCall.Import:
						importValues($.parseJSON(data));
					break;
					// Imports the first file for comparison.
					case AjaxCall.Compare1:
						dataSet1 = $.parseJSON(data);
						doAjax(projects[parseInt($("#fileCompare2").val())],AjaxCall.Compare2);
					break;
					// Imports the second file and does the comparison.
					case AjaxCall.Compare2:
						dataSet2 = $.parseJSON(data);
						drawChart(dataSet1,dataSet2);
					break;
				}
				
			},
			error:function(data){
				console.log("Error occurred: "+data);
			},
			data:formData,
			cache:false,
			contentType:false,
			processData:false,
		});
}
// Reads values from imported data and displays them.
function importValues(data){	
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
	// Calculate after successful import.
	$("#btnCalculate").trigger("click");
}
// Creates HTML options for the language select.
// Values from: http://www.qsm.com/resources/function-point-languages-table
function createOptions(){
	var optionStr="<select class='form-control' name='langSelect' id='langSelect'>";
	for(var i=0;i<options.length;i++){
		optionStr+="<option value="+options[i].value+">"+options[i].name+"</option>";
	}
	optionStr+="</select>";
	return optionStr;
}

// Initializes the variables.
function initVariables(){
	options = [
		{name:'ASP',value:51},
		{name:'Assembler',value:119},
		{name:'C',value:97},
		{name:'C++',value:50},
		{name:'C#',value:54},
		{name:'COBOL',value:61},
		{name:'HTML',value:34},
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

// Populates the selectbox with uploaded projects.
function populateSelect(){
	for(var i=0; i<projects.length; i++){
		if($("#selectProject option[value='"+i+"']").length == 0){
			$('#selectProject').append("<option value="+i+">"+fileNames[i]+"</option>");
		}
	}		
	$("#selectProject option:last").attr("selected","selected");
	$("#selectProject").show();
}

function populateCompareSelect(){
	var options = "";
	for(var key in calculations){
		options+="<option value="+key+">"+key+"</option>";
	}
	$("#fileCompare1").html(options);
	$("#fileCompare2").html(options);
}

// Compares two imported data sets and displays charts.
function drawChart(file1, file2) {
	var data1 = calculations[file1];
	var data2 = calculations[file2];
	
	// Normalize SLOC and Cost.
	data1[2][1] = data1[2][1]/1000;
	data1[4][1] = data1[4][1]/1000;
	
	data2[2][1] = data2[2][1]/1000;
	data2[4][1] = data2[4][1]/1000;

	//Create datatable using data
	var dataSet1 = google.visualization.arrayToDataTable(data1);//calculations[file1]);
	var dataSet2 = google.visualization.arrayToDataTable(data2);//calculations[file2]);
	
	//Instantiate and draws chart into div tag.
	var barChartDiff = new google.visualization.ColumnChart($('#compareChart')[0]);
	//Set options
	var options = {width: 1000, height: 500, title: "Historical Project Data Comparison"};
	//Draw diff chart
	var diffData = barChartDiff.computeDiff(dataSet1, dataSet2);
	barChartDiff.draw(diffData, options);
}

// Google API Chart for APD (Monte's part)
function drawAPDChart(chartArray) {
    var chartdata = google.visualization.arrayToDataTable(chartArray);

    var chartoptions = {
      title: 'Acquisition Phase Distribution',
      vAxis: {title: 'People'},
      hAxis: {title: 'Months'},
      isStacked: true
    };

    var apdchart = new google.visualization.ColumnChart(document.getElementById('apdChart'));
    apdchart.draw(chartdata, chartoptions);
}

// Performs basic validation on input fields.
function validate(){
	
	var fPoints =  Number($("#inputFp").val());
	var cost = Number($("#inCpp").val());
	if($.trim($("#projectName").val()).length==0){
		showError("Please enter a project name.");
		return false;
	}
	if(isNaN(fPoints) || isNaN(cost) || cost==0 || fPoints ==0){
		showError("Please enter a proper value.");
		return false;
	}
	if(fPoints<20){
		showError("Too few function points to perform calculations.");
		return false;
	}
	if(cost<0){
		showError("Cost can not be negative.");
		return false;
	}
	$("#errorInfo").fadeOut(100);
	return true;
}

// Displays errors as bootstrap alert.
function showError(text){
	$("#errorMsg").html(text);
	$("#errorInfo").fadeIn(100);
}
