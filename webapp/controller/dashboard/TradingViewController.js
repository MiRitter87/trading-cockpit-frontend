sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"./lightweight-charts.standalone.production"
], function (JSONModel) {
	"use strict";
	return {
		/**
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart : function (oCallingController) {
			var oChartModel = new JSONModel();
			var divId = oCallingController.createId("chartContainer")
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(divId).innerHTML = "";
			
			const chart = LightweightCharts.createChart(document.getElementById(divId), {
  				width: 600,
  				height: 300,
			});
			
			const lineSeries = chart.addLineSeries();
			lineSeries.setData([
			    { time: '2019-04-11', value: 80.01 },
			    { time: '2019-04-12', value: 96.63 },
			    { time: '2019-04-13', value: 76.64 },
			    { time: '2019-04-14', value: 81.89 },
			    { time: '2019-04-15', value: 74.43 },
			    { time: '2019-04-16', value: 80.01 },
			    { time: '2019-04-17', value: 96.63 },
			    { time: '2019-04-18', value: 76.64 },
			    { time: '2019-04-19', value: 81.89 },
			    { time: '2019-04-20', value: 74.43 },
			]);
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			chart.timeScale().fitContent();
			
			// Customizing the Crosshair
			chart.applyOptions({
    			crosshair: {
			        // Change mode from default 'magnet' to 'normal'.
			        // Allows the crosshair to move freely without snapping to datapoints
			        mode: LightweightCharts.CrosshairMode.Normal
    			},
			});
			
			//Handle clicks in the chart. The controller needs to be bound to access the data model within the handler.
			chart.subscribeClick(this.onChartClicked.bind(oCallingController));
			
			//The lineSeries needs to be stored in the controller for further access later on.
			oChartModel.setProperty("/lineSeries", lineSeries);
			oCallingController.getView().setModel(oChartModel, "chartModel");
		},
		
		
		/**
		 * Handles clicks in the TradingView chart.
		 */
		onChartClicked : function (param) {
			if (!param.point) {
		        return;
		    }
			
		    var oChartModel = this.getView().getModel("chartModel");
		    var lineSeries = oChartModel.getProperty("/lineSeries");
		    
		    //TODO Remove Test output
		    console.log(`The price is ${lineSeries.coordinateToPrice(param.point.y)}`);
			console.log(`The date is ${param.time}.`);
		}
	};
});