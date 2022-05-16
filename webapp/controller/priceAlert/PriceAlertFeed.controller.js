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
			var oPriceAlertModel = this.getPriceAlertForAction(oEvent);
						
			oPriceAlertModel.setProperty("/confirmationTime", new Date());			
			PriceAlertController.savePriceAlertByWebService(oPriceAlertModel, this.savePriceAlertCallback, this);
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
			oCallingController.setLastUpdateText(oCallingController);
		},
		
		
		/**
		 *  Callback function of the savePriceAlert RESTful WebService call in the PriceAlertController.
		 */
		savePriceAlertCallback : function(oReturnData) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S' || oReturnData.message[0].type == 'I') {
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'E' || oReturnData.message[0].type == 'W') {
					MessageBox.error(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Gets the price alerts.
		 */
		getAlerts: function () {			
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
		 * Gets the price alert of the FeedListItem on which the action was performed.
		 */
		getPriceAlertForAction : function (oEvent) {
			var oPriceAlertModel = new JSONModel();
			
			var oFeedListItem = oEvent.getSource();
			var oContext = oFeedListItem.getBindingContext("priceAlerts");
			var oPriceAlert = oContext.getObject();
			
			oPriceAlertModel.setData(oPriceAlert);
			
			return oPriceAlertModel;
		},
		
		
		/**
		 * Sets the text indicating the time of the last query of feeds.
		 */
		setLastUpdateText: function(oCallingController) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sText = oResourceBundle.getText("priceAlertFeed.lastUpdate");
			var oDate = new Date();
			
			sText = sText + oDate.getHours();
			sText = sText + ":";
			sText = sText + oDate.getMinutes();
			sText = sText + ":";
			sText = sText + oDate.getSeconds();
			
			oCallingController.getView().byId("lastUpdateText").setText(sText);
		}
	});
});