sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentMenu", {
		/**
		 * Handles click at the instrument create tile.
		 */
		onPriceAlertCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("instrumentCreateRoute");	
		},
		
		
		/**
		 * Handles click at the instrument edit tile.
		 */
		onPriceAlertEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("instrumentEditRoute");	
		},
		
		
		/**
		 * Handles click at the instrument display tile.
		 */
		onPriceAlertDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("instrumentDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the instrument overview tile.
		 */
		onPriceAlertOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("instrumentOverviewRoute");	
		},
	});
});