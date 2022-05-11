sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PriceAlertController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertDisplay", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			this.getView().setModel(null, "selectedPriceAlert");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the price alert ComboBox.
		 */
		onPriceAlertSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPriceAlertsModel = this.getView().getModel("priceAlerts");
			var oPriceAlert;
			var oPriceAlertModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oPriceAlert = PriceAlertController.getPriceAlertById(oSelectedItem.getKey(), oPriceAlertsModel.oData.priceAlert);
			oPriceAlertModel.setData(oPriceAlert);
			
			//Set the model of the view according to the selected price alert to allow binding of the UI elements.
			this.getView().setModel(oPriceAlertModel, "selectedPriceAlert");
			
			this.setLocalizedStockExchange();
			this.setLocalizedType();
		},


		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				//TODO: Check if needed PriceAlertController.initializeDatesAsObject(oModel.oData.priceAlert);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("priceAlertDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 * Determines and sets the localized text of the selected price alerts stock exchange.
		 */
		setLocalizedStockExchange : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel("selectedPriceAlert");
			var sStockExchangeText = "", sStockExchange = "";
			
			//1. Get the stock exchange of the selected price alert.
			if(oModel != null)
				sStockExchange = oModel.getProperty("/stockExchange");
			
			//2. Determine the localized text of the stock exchange.
			sStockExchangeText = PriceAlertController.getLocalizedStockExchangeText(sStockExchange, oResourceBundle);
			
			//3. Apply the text to the stock exchange label.
			this.getView().byId("stockExchangeText").setText(sStockExchangeText);
		},
		
		
		/**
		 * Determines and sets the localized text of the selected price alerts type.
		 */
		setLocalizedType : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel("selectedPriceAlert");
			var sTypeText = "", sType = "";
			
			//1. Get the type of the selected price alert.
			if(oModel != null)
				sType = oModel.getProperty("/alertType");
			
			//2. Determine the localized text of the type.
			sTypeText = PriceAlertController.getLocalizedTypeText(sType, oResourceBundle);
			
			//3. Apply the text to the type label.
			this.getView().byId("typeText").setText(sTypeText);
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("priceAlertComboBox").setSelectedItem(null);

			this.getView().byId("idText").setText("");
			this.getView().byId("symbolText").setText("");
			this.getView().byId("stockExchangeText").setText("");
			this.getView().byId("typeText").setText("");
			this.getView().byId("priceText").setText("");
			this.getView().byId("triggerTimeText").setText("");
			this.getView().byId("confirmationTimeText").setText("");
		}
	});
});