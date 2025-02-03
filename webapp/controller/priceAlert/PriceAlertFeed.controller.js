sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../Constants",
	"../../model/formatter",
	"sap/ui/core/IntervalTrigger",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, PriceAlertController, Constants, formatter, IntervalTrigger, MessageToast, JSONModel) {
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
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
			oCallingController.setLastUpdateText(oCallingController);
			oCallingController.playSilentDummySound();
			oCallingController.notifyIfAlertsTriggered(oCallingController);
		},
		
		
		/**
		 *  Callback function of the savePriceAlert RESTful WebService call in the PriceAlertController.
		 */
		savePriceAlertCallback : function(oReturnData) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S' || oReturnData.message[0].type === 'I') {
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'E' || oReturnData.message[0].type === 'W') {
					MessageBox.error(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Gets the price alerts.
		 */
		getAlerts: function () {			
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, 
				Constants.ALERT_TRIGGER_STATUS.TRIGGERED, Constants.ALERT_CONFIRMATION_STATUS.NOT_CONFIRMED);
		},
		
		
		/**
		 * Formatter of the info field of a price alert.
		 */
		priceAlertInfoTextFormatter: function(fPrice, sCurrency) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sFormattedCurrency = PriceAlertController.getCurrencyDisplayText(sCurrency);
			
			return oResourceBundle.getText("priceAlertFeed.priceAlert") + fPrice + " " + sFormattedCurrency;
		},
		
		
		/**
		 * Formatter of the price alert icon.
		 */
		priceAlertIconFormatter: function(sAlertType) {
			if (sAlertType === Constants.ALERT_TYPE.GREATER_OR_EQUAL) {				
				return "sap-icon://trend-up";
			}
				
			if (sAlertType === Constants.ALERT_TYPE.LESS_OR_EQUAL) {				
				return "sap-icon://trend-down";
			}
		},
		
		
		/**
		 * Gets the price alert of the FeedListItem on which the action was performed.
		 */
		getPriceAlertForAction : function (oEvent) {
			var oPriceAlertModel;
			
			var oFeedListItem = oEvent.getSource();
			var oContext = oFeedListItem.getBindingContext("priceAlerts");
			var oPriceAlert = oContext.getObject();
			
			oPriceAlertModel = PriceAlertController.getPriceAlertForWebService(oPriceAlert);
			
			return oPriceAlertModel;
		},
		
		
		/**
		 * Sets the text indicating the time of the last query of feeds.
		 */
		setLastUpdateText: function(oCallingController) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sText = oResourceBundle.getText("priceAlertFeed.lastUpdate");
			var oDate = new Date();
			
			sText = sText + oDate.toLocaleTimeString();
			
			oCallingController.getView().byId("lastUpdateText").setText(sText);
		},
		
		
		/**
		 * Notifies the user if alerts have been triggered and are not yet confirmed.
		 *
		 * Initiates a vibration (on smartphones).
		 * Plays an alert sound.
		 */
		notifyIfAlertsTriggered: function(oCallingController) {			
			var oPriceAlertsModel;
			var iNumberPriceAlerts;
			
			oPriceAlertsModel = oCallingController.getView().getModel("priceAlerts");
			iNumberPriceAlerts = oPriceAlertsModel.oData.priceAlert.length;
			
			if (iNumberPriceAlerts > 0) {
				this.vibrate(400);
				this.playAlertSound();				
			}
			else {
				this.vibrate(200);
				this.playSilentDummySound();		
			}
		},
		
		
		/**
		 * Initiate phone vibration.
		 */
		vibrate: function(iDuration) {			
			var bSupportsVibrate = "vibrate" in navigator;
			
			if (bSupportsVibrate === false)	 {				
				return;
			}	
				
			window.navigator.vibrate(iDuration);
		},
		
		
		/**
		 * Plays an alert sound.
		 */
		playAlertSound: function() {
			var audio = new Audio('alert.mp3');
			audio.play();
		},
		
		
		/**
		 * Plays a silent dummy sound.
		 *
		 * The Chrome browser on an Android device turns inactive if the display is turned off.
		 * No queries for triggered price alerts are executed then.
		 * If a sound is played cyclically, the browser process stays active even if the display is turned off.
		 * In order to continue querying for price alerts, a silent dummy sound is played periodically to keep the browser active.
		 */
		playSilentDummySound: function() {
			var audio = new Audio('silent2seconds.mp3');
			audio.play();
		}
	});
});