sap.ui.define([
	"../../MainController",
], function(MainController) {
	"use strict";
	return {
		/**
		 * Updates the chartModel with visibility information about moving averages and indicators.
		 */
		updateModelForOverlays: function(oCallingController) {
			this.updateModelForMovingAverages(oCallingController);
			this.updateModelForIndicators(oCallingController);
		},
		
		
		/**
		 * Updates the chartModel with visibility information about moving averages.
		 */
		updateModelForMovingAverages: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oEma21Button = oCallingController.getView().byId("ema21Button");
			var oSma50Button = oCallingController.getView().byId("sma50Button");
			var oSma150Button = oCallingController.getView().byId("sma150Button");
			var oSma200Button = oCallingController.getView().byId("sma200Button");
			var oSma30VolumeButton = oCallingController.getView().byId("sma30VolumeButton");
			
			if (oEma21Button.getPressed()) {
				oChartModel.setProperty("/displayEma21", true);
			} else {
				oChartModel.setProperty("/displayEma21", false);
			}
			
			if (oSma50Button.getPressed()) {
				oChartModel.setProperty("/displaySma50", true);
			} else {
				oChartModel.setProperty("/displaySma50", false);
			}
			
			if (oSma150Button.getPressed()) {
				oChartModel.setProperty("/displaySma150", true);
			} else {
				oChartModel.setProperty("/displaySma150", false);
			}
			
			if (oSma200Button.getPressed()) {
				oChartModel.setProperty("/displaySma200", true);
			} else {
				oChartModel.setProperty("/displaySma200", false);
			}
			
			if (oSma30VolumeButton.getPressed()) {
				oChartModel.setProperty("/displaySma30Volume", true);
			} else {
				oChartModel.setProperty("/displaySma30Volume", false);
			}
		},
		
		
		/**
		 * Updates the chartModel with visibility information about indicators.
		 */
		updateModelForIndicators: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oBBWButton = oCallingController.getView().byId("bbwButton");
			var oSlowStoButton = oCallingController.getView().byId("slowStochasticButton");
			var oRsLineButton = oCallingController.getView().byId("rsLineButton");
			
			if (oBBWButton.getPressed()) {
				oChartModel.setProperty("/displayBollingerBandWidth", true);
			} else {
				oChartModel.setProperty("/displayBollingerBandWidth", false);
			}
			
			if (oSlowStoButton.getPressed()) {
				oChartModel.setProperty("/displaySlowStochastic", true);
			} else {
				oChartModel.setProperty("/displaySlowStochastic", false);
			}
			
			if (oRsLineButton.getPressed()) {
				oChartModel.setProperty("/displayRsLine", true);
			} else {
				oChartModel.setProperty("/displayRsLine", false);
			}
		},
		
		
		/**
		 * Queries the chart data WebService for price/volume data of an Instrument with the given ID.
		 */
		queryChartData: function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chartData");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/priceVolume/" + sInstrumentId;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});  
		},
		
		
		/**
		 * Calls a WebService operation to create a horizontal line object.
		 */
		createHorizontalLineByWebService: function(oHorizontalLineModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oHorizontalLineModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the chartObject WebService for horizontal lines.
		 */
		queryHorizontalLinesByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			if (sInstrumentId !== undefined && sInstrumentId !== null) {				
				sQueryUrl= sQueryUrl + "?instrumentId=" + sInstrumentId;
			}
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Deletes the given horizontal line using the WebService.
		 */
		deleteHorizontalLineByWebService: function(oHorizontalLine, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oHorizontalLine.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		}
	};
});