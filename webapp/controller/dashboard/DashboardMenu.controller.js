sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardMenu", {
		/**
		 * Handles click at the statistic tile.
		 */
		onStatisticPressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("dashboardStatisticRoute");	
		},
		
		
		/**
		 * Handles click at the health status tile.
		 */
		onHealthStatusPressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("dashboardHealthStatusRoute");	
		}
	});
});