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
				oModel.setData(oCallingController.getTableModelFromInstrumentData(oReturnData.data));
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Converts the instruments provided by the WebService into a format that can be bound more easily to the table.
		 * During this process deep structures like instrument->quotations are resolved into a flat structure for each table row.
		 */
		getTableModelFromInstrumentData : function(instruments) {
			var oTableRow, oInstrument, oQuotation;
			var aTableRows = new Array();
			
			if(instruments == null)
				return aTableRows;
			
			for(var i=0; i < instruments.instrument.length; i++){
				oInstrument = instruments.instrument[i];
				
				if(oInstrument.quotations == null)
					continue;
				
				oQuotation = oInstrument.quotations[0];
				
				if(oQuotation == undefined || oQuotation.indicator == null)
					continue;
				
				oTableRow = new Object();
				oTableRow.symbol = oInstrument.symbol;
				oTableRow.name = oInstrument.name;
				oTableRow.rsNumber = oQuotation.indicator.rsPercentSum;
				
				aTableRows.push(oTableRow);
			}
			
			return aTableRows;
		}
	});
});