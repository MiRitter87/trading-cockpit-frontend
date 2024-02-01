sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ScanController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ScanController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanDisplay", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryScansByWebService(this.queryScansCallback, this, true);

			this.getView().setModel(null, "selectedScan");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the scan ComboBox.
		 */
		onScanSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oScansModel = this.getView().getModel("scans");
			var oScan;
			var oScanModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oScan = ScanController.getScanById(oSelectedItem.getKey(), oScansModel.oData.scan);
			oScanModel.setData(oScan);
			
			//Set the model of the view according to the selected scan to allow binding of the UI elements.
			this.getView().setModel(oScanModel, "selectedScan");
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
					MessageToast.show(oResourceBundle.getText("scanDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "scans");
		},
		
		
		/**
		 * Formatter of the execution status text.
		 */
		executionStatusTextFormatter: function(sStatus) {
			return ScanController.getLocalizedExecutionStatusText(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the completion status text.
		 */
		completionStatusTextFormatter: function(sStatus) {
			return ScanController.getLocalizedCompletionStatusText(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oScanModel = new JSONModel();
			
			this.getView().byId("scanComboBox").setSelectedItem(null);			
			this.getView().setModel(oScanModel, "selectedScan");
		}
	});
});