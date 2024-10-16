sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, InstrumentController,
			JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentOverview", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("instrumentOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
    	},
    	
    	
    	/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedInstrumentModel;
			
			if (this.isInstrumentSelected() === false) {
				MessageBox.error(oResourceBundle.getText("instrumentOverview.noInstrumentSelected"));
				return;
			}
			
			oSelectedInstrumentModel = new JSONModel();
			oSelectedInstrumentModel.setData(this.getSelectedInstrument());
			this.getView().setModel(oSelectedInstrumentModel, "selectedInstrument");
			
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.instrument.InstrumentOverviewDetails");
		},
		
		
		/**
		 * Handles a click at the close button of the instrument details fragment.
		 */
		onCloseDialog : function () {
			this.byId("instrumentDetailsDialog").close();
		},
    	
    	
    	/**
		 * Handles the search function of the table.
		 */
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oBinding = this.getView().byId("instrumentTable").getBinding("items");
			
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
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (this.isInstrumentSelected() === false) {
				MessageBox.error(oResourceBundle.getText("instrumentOverview.noInstrumentSelected"));
				return;
			}
			
			InstrumentController.deleteInstrumentByWebService(this.getSelectedInstrument(), this.deleteInstrumentCallback, this);
		},


		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
						
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("instrumentOverview.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Callback function of the deleteInstrument RESTful WebService call in the InstrumentController.
		 */
		deleteInstrumentCallback : function(oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					InstrumentController.queryInstrumentsByWebService(oCallingController.queryInstrumentsCallback, oCallingController, false);
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
		 * Checks if an instrument has been selected.
		 */
		isInstrumentSelected : function () {
			if (this.getView().byId("instrumentTable").getSelectedItem() === null) {				
				return false;
			} else {				
				return true;
			}
		},
		
		
		/**
		 * Gets the the selected instrument.
		 */
		getSelectedInstrument : function () {
			var oListItem = this.getView().byId("instrumentTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("instruments");
			var oSelectedInstrument = oContext.getProperty(null, oContext);
			
			return oSelectedInstrument;
		}
	});
});