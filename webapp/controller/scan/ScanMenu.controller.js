sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanMenu", {
		/**
		 * Handles click at the scan create tile.
		 */
		onScanCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("scanCreateRoute");	
		},
		
		
		/**
		 * Handles click at the scan edit tile.
		 */
		onScanEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("scanEditRoute");	
		},
		
		
		/**
		 * Handles click at the scan display tile.
		 */
		onScanDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("scanDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the scan overview tile.
		 */
		onScanOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("scanOverviewRoute");	
		},
		
		
		/**
		 * Handles click at the scan results tile.
		 */
		onScanResultsPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("scanResultsRoute");	
		}
	});
});