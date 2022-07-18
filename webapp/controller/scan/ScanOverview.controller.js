sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ScanController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ScanController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryScansByWebService(this.queryScansCallback, this, true);
    	},


		/**
		 * Callback function of the queryScans RESTful WebService call in the ScanController.
		 */
		queryScansCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("scanOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "scans");
		},
		
		
		/**
		 * Formatter of the status text.
		 */
		statusTextFormatter: function(sStatus) {
			return ScanController.getLocalizedStatusText(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		}
	});
});