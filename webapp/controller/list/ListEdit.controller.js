sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, ListController, JSONModel, MessageToast, MessageBox) {
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
		}
	});
});