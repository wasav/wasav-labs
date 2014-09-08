Highcharts.setOptions({
	global: {
		useUTC: false
	}
});

var chart;

// Init a Highchart Instance
function initChart(container, series){
	var chartConfigurationObject;

	if(chart){
		chart.destroy();
	}
	
	chartConfigurationObject = {
		chart: {
			type: 'line',
			renderTo: container
		},
		credits: {
			enabled: false
		},
		title: {
			text: null
		},
		xAxis: {
			type: "datetime"
		},
		yAxis: {
			title: {
				text: "Data",
				align: 'high',
				rotation: 0
			}
		},
		series: series,
		plotOptions: {
			series: {
				marker: {
					enabled: false
				}
			}
		}
	};
	
	// create the chart
	chart = new Highcharts.Chart(chartConfigurationObject);
}

// Triggers an AJAX request
function loadData(startDate, endDate){

	return $.ajax({
				url: path + '/data-generator.php',
				type:'GET',
				dataType:'json',
				data: {
					from: startDate,
					to: endDate
				}
			});
}

// Date formatter
function dateFormatter(dateUTC){
	var format = 		Globalize.culture().calendar.patterns['d']
				+ ' ' + Globalize.culture().calendar.patterns['t'];
	return Globalize.format(new Date(dateUTC), format);
}

function updateWindowSummary(windowDates){
	$(".from").text( dateFormatter(windowDates.windowStartDate));
	$(".to").text( dateFormatter(windowDates.windowEndDate));
}

// Callback called when the window is moved
function windowChanged(windowDates){
	updateWindowSummary(windowDates);
	
	chart.showLoading('Loading Data');
	loadData(windowDates.windowStartDate,windowDates.windowEndDate)
		.done(function(results){
			if(results && results.data && results.data.length > 0){
				for(var i=0;i<results.data.length;i++){
					if(i<chart.series.length){
						chart.series[i].update({
							data: results.data[i].data
						});
					}else{
						chart.addSeries(results.data[i]);
					}
				}
				
				chart.hideLoading();
			}
		});
}

$(document).ready(function(){
	var today = new Date().getTime(),
		range = 2 * 3600 * 1000,
		options = {
				dateFormatter: dateFormatter,
				startDate: today - 10 * range,
				endDate : today,
				range: range,
				wStartDate: today - range,
				wEndDate: today,
				windowChanged: windowChanged
		};
	var timeline = new Timeline($('.timeline-wrapper'),options);

	updateWindowSummary({
		windowStartDate:today-range,
		windowEndDate:today
	});
	loadData(today-range, today).done(function(results){
		initChart( $('.chart-area').get(0), results.data);
	});
	
	
});