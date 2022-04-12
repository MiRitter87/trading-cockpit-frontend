sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertMenu", {
		/**
		 * Handles click at the price alert create tile.
		 */
		onPriceAlertCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("priceAlertCreateRoute");	
		},
		
		
		/**
		 * Handles click at the price alert edit tile.
		 */
		onPriceAlertEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("priceAlertEditRoute");	
		}
	});
});