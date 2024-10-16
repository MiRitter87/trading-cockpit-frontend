sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../list/ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MainController, InstrumentController, ListController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("instrumentDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
			
			//Query lists to display potential name of data source list.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			
			this.getView().setModel(null, "selectedInstrument");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the instrument ComboBox.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var oInstrument;
			var oInstrumentModel = new JSONModel();
			var iSelectedInstrumentId;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
			
			iSelectedInstrumentId = Number(oSelectedItem.getKey());
			oInstrument = InstrumentController.getInstrumentById(iSelectedInstrumentId, oInstrumentsModel.oData.instrument);
			oInstrumentModel.setData(oInstrument);
			
			//Set the model of the view according to the selected instrument to allow binding of the UI elements.
			this.getView().setModel(oInstrumentModel, "selectedInstrument");
		},


		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true) {					
					MessageToast.show(oResourceBundle.getText("instrumentDisplay.dataLoaded"));			
				}
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oSelectedInstrument = new JSONModel();
			
			this.getView().byId("instrumentComboBox").setSelectedItem(null);
			this.getView().setModel(oSelectedInstrument, "selectedInstrument");
		},
		
		
		/**
		 * Formatter of the stock exchange text.
		 */
		stockExchangeTextFormatter: function(sStockExchange) {
			return MainController.getLocalizedStockExchangeText(sStockExchange, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the list name.
		 */
		listNameFormatter: function(oInstrument) {
			return InstrumentController.listNameFormatter(oInstrument, this.getView().getModel("lists"));
		}
	});
});