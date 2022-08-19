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
		 * Formatter of the status text.
		 */
		statusTextFormatter: function(sStatus) {
			return ScanController.getLocalizedStatusText(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the list list header text.
		 */
		listHeaderTextFormatter : function(aLists) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var numberOfLists = aLists.length;
			var sText = oResourceBundle.getText("scanDisplay.listListHeader", numberOfLists.toString());
			
			return sText;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("scanComboBox").setSelectedItem(null);
			this.getView().setModel(null, "selectedScan");

			this.getView().byId("idText").setText("");
			this.getView().byId("nameText").setText("");
			this.getView().byId("descriptionText").setText("");
			this.getView().byId("lastScanText").setText("");
			this.getView().byId("statusText").setText("");
			this.getView().byId("percentCompletedText").setText("");
			
			this.getView().byId("listList").destroyItems();
		}
	});
});