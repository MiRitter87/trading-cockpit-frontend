sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./PriceAlertController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, MainController, PriceAlertController, InstrumentController, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("priceAlertCreateRoute").attachMatched(this._onRouteMatched, this);
			
			PriceAlertController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query instruments for instrument selection dialog.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
			
			this.resetUIElements();
			this.initializePriceAlertModel();
    	},
    	
    	
    	/**
		 * Handles the selection of an item in the instrument ComboBox.
		 */
		onInstrumentSelectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var oInstrument;
			var sCurrency = "";
			var oPriceAlertModel;
			
			//Get the selected instrument
			if (oSelectedItem !== null) {			
				oInstrument = InstrumentController.getInstrumentById(Number(oSelectedItem.getKey()), oInstrumentsModel.oData.instrument);				
			} else {
				return;
			}
			
			//Determine the currency based on the stock exchange of the instrument
			sCurrency = PriceAlertController.getCurrencyForStockExchange(oInstrument.stockExchange);
			
			//Set the currency of the new price alert
			oPriceAlertModel = this.getView().getModel("newPriceAlert");
			oPriceAlertModel.setProperty("/currency", sCurrency);
		},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed: function() {
			//Validate price first to remove the error indication from the input field as soon as possible if the user fills in correct data.
			PriceAlertController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("newPriceAlert"), "/price");
				
			if (this.getView().byId("instrumentComboBox").getSelectedKey() === "") {
				this.showMessageOnUndefinedInstrument();
				return;
			}
			
			if (this.getView().byId("typeComboBox").getSelectedKey() === "") {
				this.showMessageOnUndefinedType();
				return;
			}
			
			if (PriceAlertController.isPriceValid(this.getView().byId("priceInput").getValue()) === false) {				
				return;
			}
			
			PriceAlertController.createPriceAlertByWebService(this.getView().getModel("newPriceAlert"), this.createPriceAlertCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed: function() {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},
		
		
		/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Callback function of the createPriceAlert RESTful WebService call in the PriceAlertController.
		 */
		createPriceAlertCallback: function(oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					oCallingController.resetUIElements();
					oCallingController.initializePriceAlertModel();
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
		 * Initializes the price alert model to which the UI controls are bound.
		 */
		initializePriceAlertModel: function() {
			var oPriceAlertModel = new JSONModel();
			
			oPriceAlertModel.loadData("model/priceAlert/priceAlertCreate.json");
			this.getView().setModel(oPriceAlertModel, "newPriceAlert");
		},


		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			this.getView().byId("typeComboBox").setSelectedItem(null);
			this.getView().byId("priceInput").setValue(0);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
		},
		
		
		/**
		 * Formatter of the currency display text.
		 */
		currencyTextFormatter: function(sCurrencyCode) {
			return PriceAlertController.getCurrencyDisplayText(sCurrencyCode);
		},
		
		
		/**
		 * Displays a message in case the instrument has not been selected.
		 */
		showMessageOnUndefinedInstrument: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("priceAlertCreate.noInstrumentSelected"));
		},
		
		
		/**
		 * Displays a message in case the type has not been selected.
		 */
		showMessageOnUndefinedType: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("priceAlertCreate.noTypeSelected"));
		}
	});
});