sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ListController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("listDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
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
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("listDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("listComboBox").setSelectedItem(null);
			this.getView().setModel(null, "selectedList");

			this.getView().byId("idText").setText("");
			this.getView().byId("nameText").setText("");
			this.getView().byId("descriptionText").setText("");
			
			this.getView().byId("instrumentList").destroyItems();
		}
	});
});