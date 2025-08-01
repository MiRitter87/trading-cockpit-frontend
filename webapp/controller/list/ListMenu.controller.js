sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListMenu", {
		/**
		 * Handles click at the list create tile.
		 */
		onListCreatePressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("listCreateRoute");	
		},
		
		
		/**
		 * Handles click at the list edit tile.
		 */
		onListEditPressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("listEditRoute");	
		},
		
		
		/**
		 * Handles click at the list display tile.
		 */
		onListDisplayPressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("listDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the list overview tile.
		 */
		onListOverviewPressed: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("listOverviewRoute");	
		}
	});
});