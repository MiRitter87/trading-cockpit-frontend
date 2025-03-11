sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"sap/m/MessageBox"
], function (Controller, MainController, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartHealthCheckTV", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.initializeHealthCheckProfileComboBox();
		},
		
		
		/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("chartHealthCheckTV.info.title");
			var sDescription = oResourceBundle.getText("chartHealthCheckTV.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
		 * Initializes the ComboBox of the health check profile.
		 */
		initializeHealthCheckProfileComboBox: function () {
			var oComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.initializeHealthCheckProfileComboBox(oComboBox, oResourceBundle);
		}
	});
});