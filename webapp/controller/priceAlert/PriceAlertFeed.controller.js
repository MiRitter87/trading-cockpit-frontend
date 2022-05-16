sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/core/IntervalTrigger",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, PriceAlertController, formatter, IntervalTrigger, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertFeed", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var intervalTrigger = new IntervalTrigger(10000);
			//".bind(this)" injects the context of "this" into the getAlerts-function.
			intervalTrigger.addListener(this.getAlerts.bind(this));
		},
		
		
		/**
		 * Handles the press on an action of an feed list item.
		 */
		onActionPressed: function(oEvent) {
			var oPriceAlert = this.getPriceAlertForAction(oEvent);
			
			//Get the price alert.
			
			//Set the date of the price alert.
			
			//Call WebService to save price alert.
			alert(oPriceAlert.id);
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
		},
		
		
		/**
		 * Formatter of the price alert icon.
		 */
		priceAlertIconFormatter: function(sAlertType) {
			if(sAlertType == "GREATER_OR_EQUAL")
				return "sap-icon://trend-up";
				
			if(sAlertType == "LESS_OR_EQUAL")
				return "sap-icon://trend-down";
		},
		
		
		/**
		 * Gets the price alert of the FeedListItem on which the action was performed..
		 */
		getPriceAlertForAction : function (oEvent) {
			var oFeedListItem = oEvent.getSource();
			var oContext = oFeedListItem.getBindingContext("priceAlerts");
			var oPriceAlert = oContext.getObject();
			
			return oPriceAlert;
		}
	});
});