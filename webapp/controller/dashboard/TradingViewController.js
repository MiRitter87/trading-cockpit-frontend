sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"./lightweight-charts.standalone.production"
], function (JSONModel, DateFormat) {
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
  				width: 800,
  				height: 400,
			});
			
			const candlestickSeries = chart.addCandlestickSeries();
			candlestickSeries.setData(this.getCandlestickSeries(oCallingController));
			
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
			
			//The candlestickSeries needs to be stored in the controller for further access later on.
			oChartModel.setProperty("/candlestickSeries", candlestickSeries);
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
		    var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
		    var oSelectedDateText = this.getView().byId("selectedDateText");
		    var oSelectedPriceText = this.getView().byId("selectedPriceText");
		    
		    oSelectedDateText.setText(param.time);
		    oSelectedPriceText.setText(candlestickSeries.coordinateToPrice(param.point.y));
		},
		
		
		/**
		 * Creates a candlestick series that contains the data to be displayed.
		 */
		getCandlestickSeries : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("quotations");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aCandlestickSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "YYYY-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for(var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
    			var oCandlestickDataset = new Object();
    			
    			oCandlestickDataset.open = oQuotation.open;
    			oCandlestickDataset.high = oQuotation.high;
    			oCandlestickDataset.low = oQuotation.low;
    			oCandlestickDataset.close = oQuotation.close;
    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oCandlestickDataset.time = sFormattedDate;
    			
    			aCandlestickSeries.push(oCandlestickDataset);
			}
			
			return aCandlestickSeries;
		}
	};
});