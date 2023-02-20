sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MainController, InstrumentController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentHealthCheck", {
		formatter: formatter,


		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("instrumentHealthCheckRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
    	},


		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
						
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("instrumentOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Formatter of the stock exchange text.
		 */
		stockExchangeTextFormatter: function(sStockExchange) {
			return MainController.getLocalizedStockExchangeText(sStockExchange, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Checks if an instrument has been selected.
		 */
		isInstrumentSelected : function () {
			if(this.getView().byId("instrumentTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected instrument.
		 */
		getSelectedInstrument : function () {
			var oListItem = this.getView().byId("instrumentTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("instruments");
			var oSelectedInstrument = oContext.getProperty(null, oContext);
			
			return oSelectedInstrument;
		}
	});
});