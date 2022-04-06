sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./MainController"
], function (Controller, MainController) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.App", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));
		},
		
		
		/**
		 * Handles the selection of the menu item: price alert.
		 */
		onPriceAlertPressed : function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("priceAlertMenuRoute");			
		}
	});
});