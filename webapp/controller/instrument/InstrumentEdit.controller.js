sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, InstrumentController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("instrumentEditRoute").attachMatched(this._onRouteMatched, this);
			
			MainController.initializeStockExchangeComboBox(this.getView().byId("stockExchangeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
				
			InstrumentController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query instrument data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
			
			this.getView().setModel(null, "selectedInstrument");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the instrument ComboBox.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var oInstrument, wsInstrument;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oInstrument = InstrumentController.getInstrumentById(oSelectedItem.getKey(), oInstrumentsModel.oData.instrument);
			if(oInstrument != null)
				wsInstrument = this.getInstrumentForWebService(oInstrument);
			
			//Set the model of the view according to the selected instrument to allow binding of the UI elements.
			this.getView().setModel(wsInstrument, "selectedInstrument");
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {				
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			InstrumentController.saveInstrumentByWebService(this.getView().getModel("selectedInstrument"), this.saveInstrumentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
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
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("instrumentEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 *  Callback function of the saveInstrument RESTful WebService call in the InstrumentController.
		 */
		saveInstrumentCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new instrument data.
					InstrumentController.queryInstrumentsByWebService(oCallingController.queryInstrumentsCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedInstrument");
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
			this.getView().byId("instrumentComboBox").setSelectedItem(null);
			this.getView().setModel(null, "selectedInstrument");
			
			this.getView().byId("idText").setText("");
			this.getView().byId("symbolInput").setValue("");
			this.getView().byId("nameInput").setValue("");
			
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			this.getView().byId("typeComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.getView().byId("instrumentComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noInstrumentSelected"));
				return;
			}
			
			if(this.getView().byId("symbolInput").getValue() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noSymbolInput"));
				return false;
			}
			
			if(this.getView().byId("typeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noTypeSelected"));
				return false;
			}
			
			if(this.getView().byId("stockExchangeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noStockExchangeSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Creates a representation of an Instrument that can be processed by the WebService.
		 */
		getInstrumentForWebService : function(oInstrument) {
			var wsInstrument = new JSONModel();
			
			//Simple attributes
			wsInstrument.setProperty("/id", oInstrument.id);
			wsInstrument.setProperty("/symbol", oInstrument.symbol);
			wsInstrument.setProperty("/type", oInstrument.type);
			wsInstrument.setProperty("/stockExchange", oInstrument.stockExchange);
			wsInstrument.setProperty("/name", oInstrument.name);
			
			//References
			if(oInstrument.sector != null)
				wsInstrument.setProperty("/sectorId", oInstrument.sector.id);
				
			if(oInstrument.industryGroup != null)
				wsInstrument.setProperty("/industryGroupId", oInstrument.industryGroup.id);
			
			return wsInstrument;
		}
	});
});