sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ScanController",
	"../list/ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ScanController, ListController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query scan data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryScansByWebService(this.queryScansCallback, this, true);
			//Query lists for list selection dialog.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);

			this.getView().setModel(null, "selectedScan");
			//this.resetUIElements();
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
					MessageToast.show(oResourceBundle.getText("scanEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "scans");
		},
		
		
		/**
		 * Callback function of the queryListsByWebService RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "lists");
		}
	});
});