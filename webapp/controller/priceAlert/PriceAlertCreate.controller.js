sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, PriceAlertController, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("priceAlertCreateRoute").attachMatched(this._onRouteMatched, this);
			
			PriceAlertController.initializeStockExchangeComboBox(this.getView().byId("stockExchangeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
				
			PriceAlertController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.resetUIElements();
			this.initializePriceAlertModel();
    	},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			//Validate price first to remove the error indication from the input field as soon as possible if the user fills in correct data.
			PriceAlertController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("newPriceAlert"), "/price");
				
			if(this.getView().byId("stockExchangeComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedStockExchange();
				return;
			}
			
			if(this.getView().byId("typeComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedType();
				return;
			}
			
			if(PriceAlertController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return;
			
			/*MaterialController.createMaterialbyWebService(this.getView().getModel("newMaterial"), this.saveMaterialCallback, this);*/
		},


		/**
		 * Initializes the price alert model to which the UI controls are bound.
		 */
		initializePriceAlertModel : function () {
			var oPriceAlertModel = new JSONModel();
			
			oPriceAlertModel.loadData("model/priceAlert/priceAlertCreate.json");
			this.getView().setModel(oPriceAlertModel, "newPriceAlert");
		},


		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			this.getView().byId("typeComboBox").setSelectedItem(null);
			this.getView().byId("priceInput").setValue(0);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
		},
		
		
		/**
		 * Displays a message in case the stock exchange has not been selected.
		 */
		showMessageOnUndefinedStockExchange : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("priceAlertCreate.noStockExchangeSelected"));
		},
		
		
		/**
		 * Displays a message in case the type has not been selected.
		 */
		showMessageOnUndefinedType : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("priceAlertCreate.noTypeSelected"));
		}
	});
});