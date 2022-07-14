sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ScanController",
	"../list/ListController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ScanController, ListController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanEdit", {
		formatter: formatter,
		
		
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
		 * Handles the selection of an item in the scan ComboBox.
		 */
		onScanSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oScansModel = this.getView().getModel("scans");
			var oScan, wsScan;
			var oSelectDialog = this.getView().byId("listSelectionDialog");
			var listsModel = this.getView().getModel("lists");
			
			if(oSelectedItem == null) {
				//this.resetUIElements();
				return;
			}			
			
			//Reset the selected lists of the scan selected before.
			if(oSelectDialog != undefined)
				oSelectDialog.clearSelection();
									
			oScan = ScanController.getScanById(oSelectedItem.getKey(), oScansModel.oData.scan);
			if(oScan != null)
				wsScan = this.getScanForWebService(oScan);
			
			//Set the model of the view according to the selected scan to allow binding of the UI elements.
			this.getView().setModel(wsScan, "selectedScan");
			
			//Refresh lists model to trigger formatter in listSelectionDialog.
			//This assures the lists of the selected scan are correctly selected.
			listsModel.refresh(true);
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
		},
		
		
		/**
		 * Creates a representation of a scan that can be processed by the WebService.
		 */
		getScanForWebService : function(oScan) {
			var wsScan = new JSONModel();
			
			//Data at head level
			wsScan.setProperty("/id", oScan.id);
			wsScan.setProperty("/name", oScan.name);
			wsScan.setProperty("/description", oScan.description);
			wsScan.setProperty("/lastScan", oScan.lastScan);
			wsScan.setProperty("/status", oScan.status);
			wsScan.setProperty("/percentCompleted", oScan.percentCompleted);
			
			//Data at item level
			wsScan.setProperty("/listIds", new Array());
			
			for(var i = 0; i < oScan.lists.length; i++) {
				var oList = oScan.lists[i];
				
				wsScan.oData.listIds.push(oList.id);
			}
			
			return wsScan;
		},
		
		
		/**
		 * Formatter of the status text.
		 */
		statusTextFormatter: function(sStatus) {
			return ScanController.getLocalizedStatusText(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		}
	});
});