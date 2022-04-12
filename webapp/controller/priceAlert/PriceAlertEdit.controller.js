sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PriceAlertController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertEdit", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query price alert data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			this.getView().setModel(null, "selectedPriceAlert");
			//this.resetUIElements();
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
				//this.resetUIElements();				
				return;
			}
				
			oPriceAlert = PriceAlertController.getPriceAlertById(oSelectedItem.getKey(), oPriceAlertsModel.oData.priceAlert);
			oPriceAlertModel.setData(oPriceAlert);
			
			//Set the model of the view according to the selected price alert to allow binding of the UI elements.
			this.getView().setModel(oPriceAlertModel, "selectedPriceAlert");
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oPriceAlert.price);
		},


		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				PriceAlertController.initializeDatesAsObject(oModel.oData.priceAlert);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("priceAlertEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 * Sets the value of the priceInput.
		 */
		setPriceInputValue : function(fValue) {
			this.getView().byId("priceInput").setValue(fValue);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
		},
	});
});