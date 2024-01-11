sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.ChartMenu", {
		/**
		 * Handles click at the Advance/Decline Number tile.
		 */
		onAdvanceDeclineNumberPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAdvanceDeclineNumberRoute");	
		},
		
		
		/**
		 * Handles click at the Quota above SMA(50) tile.
		 */
		onAboveSma50Pressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAboveSma50Route");	
		},
		
		
		/**
		 * Handles click at the Quota above SMA(200) tile.
		 */
		onAboveSma200Pressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAboveSma200Route");	
		}
	});
});