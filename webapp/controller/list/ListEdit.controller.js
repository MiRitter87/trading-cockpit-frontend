sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./ListController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, ListController, InstrumentController, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("listEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query list data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ListController.queryListsByWebService(this.queryListsCallback, this, true);
			//Query instruments for instrument selection dialog.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);

			this.getView().setModel(null, "selectedList");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the list ComboBox.
		 */
		onListSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oListsModel = this.getView().getModel("lists");
			var oList, wsList;
			var oSelectDialog = this.getView().byId("instrumentSelectionDialog");
			var instrumentsModel = this.getView().getModel("instruments");
			
			if(oSelectedItem == null) {
				this.resetUIElements();
				return;
			}			
			
			//Reset the selected instruments of the list selected before.
			if(oSelectDialog != undefined)
				oSelectDialog.clearSelection();
									
			oList = ListController.getListById(oSelectedItem.getKey(), oListsModel.oData.list);
			if(oList != null)
				wsList = this.getListForWebService(oList);
			
			//Set the model of the view according to the selected list to allow binding of the UI elements.
			this.getView().setModel(wsList, "selectedList");
			
			//Refresh instruments model to trigger formatter in instrumentSelectionDialog.
			//This assures the instruments of the selected list are correctly selected.
			instrumentsModel.refresh(true);
		},
		
		
		/**
		 * Handles a click at the open instrument selection button.
		 */
		onSelectInstrumentsPressed : function () {
			if(this.getView().byId("listComboBox").getSelectedKey() == "") {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("listEdit.noListSelected"));
				return;
			}
			
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
			var oSelectedListModel = this.getView().getModel("selectedList");
			var aInstrumentArray = new Array();
			
			if (aContexts) {		//Is defined if user clicks "accept" and is undefined if user clicks "cancel".
				for(var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					aInstrumentArray.push(oContext.getObject().id);
				}				
				
				oSelectedListModel.setProperty("/instrumentIds", aInstrumentArray);
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
				
			ListController.saveListByWebService(this.getView().getModel("selectedList"), this.saveListCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},


		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("listEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
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
		 *  Callback function of the saveList RESTful WebService call in the ListController.
		 */
		saveListCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new list data.
					ListController.queryListsByWebService(oCallingController.queryListsCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedList");
					oCallingController.resetUIElements();
					
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'I') {
					MessageToast.show(oReturnData.message[0].text);
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oSelectedList = new JSONModel();
			var oSelectDialog = this.getView().byId("instrumentSelectionDialog");
			
			if(oSelectDialog != undefined)
				oSelectDialog.clearSelection();
			
			this.getView().byId("listComboBox").setSelectedItem(null);
			this.getView().setModel(oSelectedList, "selectedList");
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
				MessageBox.error(oResourceBundle.getText("listEdit.noNameInput"));
				return false;
			}
			
			//The list has to have at least one instrument.
			oListModel = this.getView().getModel("selectedList");
			iExistingInstrumentCount = oListModel.oData.instrumentIds.length;
			
			if(iExistingInstrumentCount < 1) {
				MessageBox.error(oResourceBundle.getText("listEdit.noInstrumentsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Creates a representation of a list that can be processed by the WebService.
		 */
		getListForWebService : function(oList) {
			var wsList = new JSONModel();
			
			//Data at head level
			wsList.setProperty("/id", oList.id);
			wsList.setProperty("/name", oList.name);
			wsList.setProperty("/description", oList.description);
			
			//Data at item level
			wsList.setProperty("/instrumentIds", new Array());
			
			for(var i = 0; i < oList.instruments.length; i++) {
				var oInstrument = oList.instruments[i];
				
				wsList.oData.instrumentIds.push(oInstrument.id);
			}
			
			return wsList;
		},
		
		
		/**
		 * Formatter that determines the selected instruments of a list for the SelectDialog.
		 */
		isInstrumentSelectedFormatter : function(iInstrumentId) {
			var oSelectedList = this.getView().getModel("selectedList");
			var aInstruments;
			
			if(oSelectedList == null)
				return false;
				
			aInstruments = oSelectedList.getProperty("/instrumentIds");
			
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
		},
		
		
		/**
		 * Formatter of the symbol text.
		 */
		symbolTextFormatter : function(sSymbol) {
			return ListController.symbolTextFormatter(sSymbol);
		}
	});
});