sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../scan/ScanController",
	"../Constants",
	"sap/ui/model/json/JSONModel"
], function (Controller, MainController, ScanController, Constants, JSONModel) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardHealthStatus", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardHealthStatusRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query only instruments that have quotations referenced. Otherwise no health status can be determined.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
			
			this.resetUIElements();
    	},
    	
    	
    	/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
			MainController.applyFilterToInstrumentsComboBox(oInstrumentComboBox,
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP]);
		},
    	
    	
    	/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");

			oInstrumentComboBox.setSelectedKey("");
		}
	});
});