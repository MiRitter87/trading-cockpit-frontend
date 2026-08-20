sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../instrument/InstrumentController",
	"../../scan/ScanResultsHelper",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, InstrumentController, ScanResultsHelper, Constants, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartBrowser", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartBrowserRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query master data every time a user navigates to this view. This assures that changes are being fetched.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this);
    	},
		
		
		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
						
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Formatter of the chart URL.
		 */
		chartUrlFormatter: function(oInstrument) {
			var sBaseChartUrl = "https://stockcharts.com/c-sc/sc?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&i=p87853059193&r=1787127613780";
			
			if (!oInstrument) {
		        return "";
		    }

		    if (oInstrument.type === Constants.INSTRUMENT_TYPE.RATIO ||
		        oInstrument.dataSourceListId !== undefined) {
		        return "";
		    }

		    return ScanResultsHelper.getChartUrlNonRatio(oInstrument, sBaseChartUrl);
		}
	});
});