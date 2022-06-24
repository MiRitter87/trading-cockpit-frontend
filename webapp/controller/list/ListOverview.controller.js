sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ListController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ListController, MainController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListOverview", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("listOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ListController.queryListsByWebService(this.queryListsCallback, this, true);
    		},


		/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedListModel;
			
			if(this.isListSelected() == false) {
				MessageBox.error(oResourceBundle.getText("listOverview.noListSelected"));
				return;
			}
			
			oSelectedListModel = new JSONModel();
			oSelectedListModel.setData(this.getSelectedList());
			this.getView().setModel(oSelectedListModel, "selectedList");		
			
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.list.ListOverviewDetails");
		},


		/**
		 * Handles a click at the close button of the list details fragment.
		 */
		onCloseDialog : function () {
			this.byId("listDetailsDialog").close();
		},


		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isListSelected() == false) {
				MessageBox.error(oResourceBundle.getText("listOverview.noListSelected"));
				return;
			}
			
			ListController.deleteListByWebService(this.getSelectedList(), this.deleteListCallback, this);
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
					MessageToast.show(oResourceBundle.getText("listOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},


		/**
		 * Callback function of the deleteList RESTful WebService call in the ListController.
		 */
		deleteListCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					ListController.queryListsByWebService(oCallingController.queryListsCallback, oCallingController, false);
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
		 * Checks if a list has been selected.
		 */
		isListSelected : function () {
			if(this.getView().byId("listTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected list.
		 */
		getSelectedList : function () {
			var oListItem = this.getView().byId("listTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("lists");
			var oSelectedList = oContext.getProperty(null, oContext);
			
			return oSelectedList;
		}
	});
});