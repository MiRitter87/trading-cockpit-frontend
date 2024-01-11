sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.ChartAboveSma50", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			
    	},
    	
    	
    	/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("chartAboveSma50.info.title");
			var sDescription = oResourceBundle.getText("chartAboveSma50.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			
		},
		
		
		/**
		 * Handles error during loading of the chart image using the given URL.
		 */
		onChartImageError : function() {
			
		}
	});
});