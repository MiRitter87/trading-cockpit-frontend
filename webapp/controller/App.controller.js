sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.App", {
		/**
		 * Handles the click at the price alert entry in the menu.
		 */
		onPriceAlertPressed : function() {
			alert("Price Alert pressed");
		}
	});
});