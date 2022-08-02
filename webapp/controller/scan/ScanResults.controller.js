sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, InstrumentController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanResults", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanResultsRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true, "MOST_RECENT");
    	},
    	
    	
    	/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Formatter of the RS Number.
		 */
		rsNumberFormatter: function(aQuotations) {
			var oQuotation;
			
			if(aQuotations == null || aQuotations == undefined || aQuotations.length == 0)
				return "";
			else {
				oQuotation = aQuotations[0];
				
				if(oQuotation.indicator == null || oQuotation.indicator == undefined)
					return "";
				else
					return oQuotation.indicator.rsPercentSum;
			}
		}
	});
});