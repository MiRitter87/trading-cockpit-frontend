sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./ListController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, ListController, InstrumentController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("listCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query instruments for instrument selection dialog.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
			
			this.resetUIElements();
			this.initializeListModel();
    	},

		
		/**
		 * Handles a click at the open instrument selection button.
		 */
		onSelectInstrumentsPressed : function () {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.list.InstrumentSelectionDialog");
		},
		
		
		/**
		 * Handles the search function in the SelectDialog of instruments.
		 */
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getParameter("itemsBinding");
			
			var oFilterSymbol = new Filter("symbol", FilterOperator.Contains, sValue);
			var oFilterName = new Filter("name", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSymbol, oFilterName],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the closing of the SelectDialog of instruments.
		 */
		onDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oNewListModel = this.getView().getModel("newList");
			var aInstrumentArray = new Array();
			
			if (aContexts && aContexts.length) {
				for(var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					aInstrumentArray.push(oContext.getObject().id);
				}
											
				oNewListModel.setProperty("/instrumentIds", aInstrumentArray);
			}
			
			oEvent.getSource().getBinding("items").filter([]);
		},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;

			ListController.createListByWebService(this.getView().getModel("newList"), this.createListCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},
		
		
		/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "instruments");
		},


		/**
		 * Callback function of the createList RESTful WebService call in the ListController.
		 */
		createListCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					oCallingController.resetUIElements();
					oCallingController.initializeListModel();
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		},


		/**
		 * Initializes the list model to which the UI controls are bound.
		 */
		initializeListModel : function () {
			var oListModel = new JSONModel();
			
			oListModel.loadData("model/list/listCreate.json");
			this.getView().setModel(oListModel, "newList");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oSelectDialog = this.getView().byId("instrumentSelectionDialog");
			
			if(oSelectDialog != undefined)
				oSelectDialog.clearSelection();
		},


		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingInstrumentCount;
			var oListModel;

			if(this.getView().byId("nameInput").getValue() == "") {
				MessageBox.error(oResourceBundle.getText("listCreate.noNameInput"));
				return false;
			}
			
			//The list has to have at least one instrument.
			oListModel = this.getView().getModel("newList");
			iExistingInstrumentCount = oListModel.oData.instrumentIds.length;
			
			if(iExistingInstrumentCount < 1) {
				MessageBox.error(oResourceBundle.getText("listCreate.noInstrumentsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Formatter that determines the selected instruments of a list for the SelectDialog.
		 */
		isInstrumentSelectedFormatter : function(iInstrumentId) {
			var oNewList = this.getView().getModel("newList");
			var aInstruments = oNewList.getProperty("/instrumentIds");

			if(aInstruments == undefined)
				return false;

			for(var iIndex = 0; iIndex < aInstruments.length; iIndex++) {
				if(aInstruments[iIndex] == iInstrumentId)
					return true;
			}

			return false;
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		}
	});
});