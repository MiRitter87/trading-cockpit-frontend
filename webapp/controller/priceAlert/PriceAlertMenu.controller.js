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
		},
		
		
		/**
		 * Handles click at the price alert display tile.
		 */
		onPriceAlertDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("priceAlertDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the price alert overview tile.
		 */
		onPriceAlertOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("priceAlertOverviewRoute");	
		}
	});
});