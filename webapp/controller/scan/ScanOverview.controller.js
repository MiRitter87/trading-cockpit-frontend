sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ScanController",
	"../MainController",
	"../Constants",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ScanController, MainController, Constants, formatter, JSONModel, MessageToast, MessageBox) {
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
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedScanModel;
			
			if (this.isScanSelected() === false) {
				MessageBox.error(oResourceBundle.getText("scanOverview.noScanSelected"));
				return;
			}
			
			oSelectedScanModel = new JSONModel();
			oSelectedScanModel.setData(this.getSelectedScan());
			this.getView().setModel(oSelectedScanModel, "selectedScan");		
			
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.ScanOverviewDetails");
		},
		
		
		/**
		 * Handles the press-event of the start scan button.
		 */
		onStartScanPressed: function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (this.isScanSelected() === false) {
				MessageBox.error(oResourceBundle.getText("scanOverview.noScanSelected"));
				return;
			}
			
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.ScanStartDialog");		
		},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (this.isScanSelected() === false) {
				MessageBox.error(oResourceBundle.getText("scanOverview.noScanSelected"));
				return;
			}
			
			ScanController.deleteScanByWebService(this.getSelectedScan(), this.deleteScanCallback, this);
		},
		
		
		/**
		 * Handles the press-event of the refresh button.
		 */
		onRefreshPressed : function() {
			ScanController.queryScansByWebService(this.queryScansCallback, this, true);
		},
		
		
		/**
		 * Handles a click at the close button of the list details fragment.
		 */
		onCloseDialog : function () {
			this.byId("scanDetailsDialog").close();
		},
		
		
		/** 
		 * Handles tasks to be performed after the scan start dialog has been opened.
		 */
		onStartScanDialogOpened : function () {
			this.initializeScopeComboBox();
		},
		
		
		/**
		 * Handles a click at the start button of the start scan dialog.
		 */
		onStartScanDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oScan, oScanWS;
			var sSelectedScope = this.getView().byId("scanScopeComboBox").getSelectedKey();
			
			oScan = this.getSelectedScan();
			if (oScan === null) {
				return;
			}
			
			oScanWS = ScanController.getScanForWebService(oScan);
			
			if (sSelectedScope === "") {
				MessageBox.error(oResourceBundle.getText("scanOverview.noScanScopeSelected"));
				return;				
			}
			else if (sSelectedScope === Constants.SCAN_SCOPE.ALL) {
				oScanWS.setProperty("/completionStatus", Constants.SCAN_COMPLETION_STATUS.COMPLETE);
			}
					
			oScanWS.setProperty("/executionStatus", Constants.SCAN_EXECUTION_STATUS.IN_PROGRESS);
			ScanController.saveScanByWebService(oScanWS, this.saveScanCallback, this);
			
			this.byId("startScanDialog").close();
		},
		
		
		/**
		 * Handles a click at the cancel button of the start scan dialog.
		 */
		onCancelScanDialog : function () {
			this.byId("startScanDialog").close();
		},


		/**
		 * Callback function of the queryScans RESTful WebService call in the ScanController.
		 */
		queryScansCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("scanOverview.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "scans");
		},
		
		
		/**
		 * Callback function of the deleteScan RESTful WebService call in the ScanController.
		 */
		deleteScanCallback : function(oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					ScanController.queryScansByWebService(oCallingController.queryScansCallback, oCallingController, false);
				}
				
				if (oReturnData.message[0].type === 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 *  Callback function of the saveScan RESTful WebService call in the ScanController.
		 */
		saveScanCallback : function(oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					ScanController.queryScansByWebService(oCallingController.queryScansCallback, oCallingController, false);
				}
				
				if (oReturnData.message[0].type === 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Checks if a scan has been selected.
		 */
		isScanSelected : function () {
			if (this.getView().byId("scanTable").getSelectedItem() === null) {				
				return false;
			} else {				
				return true;
			}
		},
		
		
		/**
		 * Gets the the selected scan.
		 */
		getSelectedScan : function () {
			var oListItem = this.getView().byId("scanTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("scans");
			var oSelectedScan = oContext.getProperty(null, oContext);
			
			return oSelectedScan;
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
		 * Initializes the ComboBox of scan scope of the start scan dialog.
		 */
		initializeScopeComboBox : function () {
			var oComboBox = this.getView().byId("scanScopeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oComboBox.getItems().length === 2) {				
				return;		//ComboBox is already initialized.
			}
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.SCAN_SCOPE.ALL, "scanOverview.scanScope.all");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.SCAN_SCOPE.INCOMPLETE, "scanOverview.scanScope.incomplete");
		},
	});
});