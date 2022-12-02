sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants"
], function (Controller, MainController, Constants) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardCharts", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.initializeTypeComboBox();
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oImage = this.getView().byId("chartImage");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var sSelectedType = oTypeComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/statistic");
			var sQueryUrl;
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/chart?chartType=" + sSelectedType + "&randomDate=" + new Date().getTime();
			
			if(sSelectedType != "")
				oImage.setSrc(sQueryUrl);
			else
				oImage.setSrc(null);
		},
		
		
		/**
		 * Initializes the ComboBox of chart type.
		 */
		initializeTypeComboBox : function () {
			var oComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER, "dashboardCharts.type.advanceDeclineNumber");
		}
	});
});