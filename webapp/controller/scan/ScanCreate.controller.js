sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./ScanController",
	"../list/ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, ScanController, ListController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
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
		 * Handles a click at the open list selection button.
		 */
		onSelectListsPressed : function () {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.ListSelectionDialog");
		},
		
		
		/**
		 * Handles the search function in the SelectDialog of lists.
		 */
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getParameter("itemsBinding");
			
			var oFilterName = new Filter("name", FilterOperator.Contains, sValue);
			var oFilterDescription = new Filter("description", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterName, oFilterDescription],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the closing of the SelectDialog of lists.
		 */
		onDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oNewScanModel = this.getView().getModel("newScan");
			var aListArray = new Array();
			
			if (aContexts && aContexts.length) {
				for (var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					aListArray.push(oContext.getObject().id);
				}
											
				oNewScanModel.setProperty("/listIds", aListArray);
			}
			
			oEvent.getSource().getBinding("items").filter([]);
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if (bInputValid === false) {				
				return;
			}

			ScanController.createScanByWebService(this.getView().getModel("newScan"), this.createScanCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},


		/**
		 * Callback function of the queryListsByWebService RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "lists");
		},
		
		
		/**
		 * Callback function of the createScan RESTful WebService call in the ScanController.
		 */
		createScanCallback : function (oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					oCallingController.resetUIElements();
					oCallingController.initializeScanModel();
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oSelectDialog = this.getView().byId("listSelectionDialog");
			
			if (oSelectDialog !== undefined) {				
				oSelectDialog.clearSelection();
			}
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingListCount;
			var oScanModel;

			if (this.getView().byId("nameInput").getValue() === "") {
				MessageBox.error(oResourceBundle.getText("scanCreate.noNameInput"));
				return false;
			}
			
			//The scan has to have at least one list.
			oScanModel = this.getView().getModel("newScan");
			iExistingListCount = oScanModel.oData.listIds.length;
			
			if (iExistingListCount < 1) {
				MessageBox.error(oResourceBundle.getText("scanCreate.noListsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Initializes the scan model to which the UI controls are bound.
		 */
		initializeScanModel : function () {
			var oScanModel = new JSONModel();
			
			oScanModel.loadData("model/scan/scanCreate.json");
			this.getView().setModel(oScanModel, "newScan");
		},
		
		
		/**
		 * Formatter that determines the selected lists of a list for the SelectDialog.
		 */
		isListSelectedFormatter : function(iListId) {
			var oNewScan = this.getView().getModel("newScan");
			var aLists = oNewScan.getProperty("/listIds");

			if (aLists === undefined) {				
				return false;
			}

			for (var iIndex = 0; iIndex < aLists.length; iIndex++) {
				if (aLists[iIndex] === iListId) {					
					return true;
				}
			}

			return false;
		}
	});
});