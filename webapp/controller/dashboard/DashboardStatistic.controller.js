sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	"./DashboardController",
	"../instrument/InstrumentController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Constants, DashboardController, InstrumentController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardStatistic", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardStatisticRoute").attachMatched(this._onRouteMatched, this);
			
			InstrumentController.initializeTypeComboBox(oTypeComboBox, this.getOwnerComponent().getModel("i18n").getResourceBundle());
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query statistic data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DashboardController.queryStatisticsByWebService(this.queryStatisticsCallback, this, true, Constants.INSTRUMENT_TYPE.STOCK);
    	},
    	
    	
    	/**
    	 * Handles the button press event of the refresh statistic button.
    	 */
    	onRefreshPressed : function() {
			var sSelectedType = "";
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			sSelectedType = oTypeComboBox.getSelectedKey();
			
			if(sSelectedType == "")
				MessageBox.information(oResourceBundle.getText("dashboardStatistic.noTypeSelected"));
			
			DashboardController.queryStatisticsByWebService(this.queryStatisticsCallback, this, true, sSelectedType);
		},
    	
    	
    	/**
		 * Callback function of the queryStatistics RESTful WebService call in the ScanController.
		 */
		queryStatisticsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("dashboardStatistic.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "statistics");
		}
	});
});