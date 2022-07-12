sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../list/ListController",
	"sap/ui/model/json/JSONModel"
], function (Controller, ListController, JSONModel) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("scanCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query lists for list selection dialog.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			
			this.resetUIElements();
			this.initializeScanModel();
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
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			/*var oSelectDialog = this.getView().byId("listSelectionDialog");
			
			if(oSelectDialog != undefined)
				oSelectDialog.clearSelection();*/
		},
		
		
		/**
		 * Initializes the scan model to which the UI controls are bound.
		 */
		initializeScanModel : function () {
			var oScanModel = new JSONModel();
			
			oScanModel.loadData("model/scan/scanCreate.json");
			this.getView().setModel(oScanModel, "newScan");
		}
	});
});