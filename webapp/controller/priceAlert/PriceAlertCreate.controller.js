sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"sap/ui/model/json/JSONModel"
], function (Controller, PriceAlertController, JSONModel) {
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
		}
	});
});