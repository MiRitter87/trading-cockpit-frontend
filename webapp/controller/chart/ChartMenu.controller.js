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
	});
});