sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ListController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, ListController, InstrumentController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.list.ListDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("listDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ListController.queryListsByWebService(this.queryListsCallback, this, true);

			this.getView().setModel(null, "selectedList");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the list ComboBox.
		 */
		onListSelectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oListsModel = this.getView().getModel("lists");
			var oList;
			var oListModel = new JSONModel();
			
			if (oSelectedItem === null) {
				this.resetUIElements();				
				return;
			}
			
			oList = ListController.getListById(Number(oSelectedItem.getKey()), oListsModel.oData.list);
			oListModel.setData(oList);
			
			//Set the model of the view according to the selected list to allow binding of the UI elements.
			this.getView().setModel(oListModel, "selectedList");
		},


		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback: function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("listDisplay.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oListModel = new JSONModel();
			
			this.getView().byId("listComboBox").setSelectedItem(null);	
			this.getView().setModel(oListModel, "selectedList");
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
		symbolTextFormatter: function(sSymbol) {
			return ListController.symbolTextFormatter(sSymbol);
		}
	});
});