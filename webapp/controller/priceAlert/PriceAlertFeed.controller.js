sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/IntervalTrigger"
], function (Controller, IntervalTrigger) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertFeed", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var intervalTrigger = new IntervalTrigger(10000);
			intervalTrigger.addListener(this.getAlerts);
		},
		
		
		/**
		 * Gets the price alerts.
		 */
		getAlerts: function () {
			alert(Date.now());
		}
	});
});