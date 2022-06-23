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
			var oList;
			var oListModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oList = ListController.getListById(oSelectedItem.getKey(), oListsModel.oData.list);
			oListModel.setData(oList);
			
			//Set the model of the view according to the selected list to allow binding of the UI elements.
			this.getView().setModel(oListModel, "selectedList");
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
			
			if (aContexts && aContexts.length) {
				for(var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					aInstrumentArray.push(oContext.getObject());
				}				
				
				oSelectedListModel.setProperty("/instruments", aInstrumentArray);
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
			this.getView().byId("listComboBox").setSelectedItem(null);
			this.getView().setModel(null, "selectedList");
			
			this.getView().byId("idText").setText("");
			this.getView().byId("nameInput").setValue("");
			this.getView().byId("descriptionTextArea").setValue("");
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
			iExistingInstrumentCount = oListModel.oData.instruments.length;
			
			if(iExistingInstrumentCount < 1) {
				MessageBox.error(oResourceBundle.getText("listEdit.noInstrumentsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Formatter that determines the selected instruments of a list for the SelectDialog.
		 */
		isInstrumentSelectedFormatter : function(iInstrumentId) {
			var oSelectedList = this.getView().getModel("selectedList");
			var aInstruments = oSelectedList.getProperty("/instruments");
			
			for(var iIndex = 0; iIndex < aInstruments.length; iIndex++) {
				if(aInstruments[iIndex].id == iInstrumentId)
					return true;
			}
			
			return false;
		}
	});
});