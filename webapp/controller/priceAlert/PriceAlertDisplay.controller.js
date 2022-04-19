sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../model/formatter"
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertDisplay", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			
		}
	});
});