sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"sap/ui/core/IntervalTrigger",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, PriceAlertController, IntervalTrigger, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertFeed", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var intervalTrigger = new IntervalTrigger(10000);
			//".bind(this)" injects the context of "this" into the getAlerts-function.
			intervalTrigger.addListener(this.getAlerts.bind(this));
		},
		
		
		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);		
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 * Gets the price alerts.
		 */
		getAlerts: function () {
			//TODO Add new status field in view indicating time of last server query
			
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, "TRIGGERED", "NOT_CONFIRMED");
		},
		
		
		/**
		 * Formatter of the price alert text.
		 */
		priceAlertTextFormatter: function(sSymbol, sStockExchange) {
			return sSymbol + " (" + sStockExchange + ")";
		},
		
		
		/**
		 * Formatter of the info field of a price alert.
		 */
		priceAlertInfoTextFormatter: function(fPrice) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			return oResourceBundle.getText("priceAlertFeed.priceAlert") + fPrice;
		}
	});
});