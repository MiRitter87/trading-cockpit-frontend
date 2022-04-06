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
		 * Handles the click at the price alert entry in the menu.
		 */
		onPriceAlertPressed : function() {
			alert("Price Alert pressed");
		}
	});
});