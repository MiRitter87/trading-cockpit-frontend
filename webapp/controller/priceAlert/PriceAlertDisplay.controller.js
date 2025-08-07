sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, PriceAlertController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertDisplay", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the price alert ComboBox.
		 */
		onPriceAlertSelectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPriceAlertsModel = this.getView().getModel("priceAlerts");
			var aPriceAlerts = oPriceAlertsModel.getProperty("/priceAlert");
			var oPriceAlert;
			var oPriceAlertModel = new JSONModel();
			
			if (oSelectedItem === null) {
				this.resetUIElements();				
				return;
			}
				
			oPriceAlert = PriceAlertController.getPriceAlertById(Number(oSelectedItem.getKey()), aPriceAlerts);
			oPriceAlertModel.setData(oPriceAlert);
			
			//Set the model of the view according to the selected price alert to allow binding of the UI elements.
			this.getView().setModel(oPriceAlertModel, "selectedPriceAlert");
		},


		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback: function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("priceAlertDisplay.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return PriceAlertController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the price and currency display text.
		 */
		priceCurrencyTextFormatter: function(sPrice, sCurrencyCode) {
			var sPriceCurrencyString = "";
			var sFormattedCurrency = PriceAlertController.getCurrencyDisplayText(sCurrencyCode);
			
			sPriceCurrencyString = sPrice + " " + sFormattedCurrency;
			
			return sPriceCurrencyString;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oPriceAlertModel = new JSONModel();
			
			this.getView().setModel(oPriceAlertModel, "selectedPriceAlert");
			
			this.getView().byId("priceAlertComboBox").setSelectedItem(null);
			this.getView().byId("priceText").setText("");
		}
	});
});