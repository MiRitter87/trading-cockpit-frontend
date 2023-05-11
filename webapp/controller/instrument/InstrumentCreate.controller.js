sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MainController, InstrumentController, Constants, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("instrumentCreateRoute").attachMatched(this._onRouteMatched, this);
			
			MainController.initializeStockExchangeComboBox(this.getView().byId("stockExchangeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
				
			InstrumentController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.resetUIElements();
			this.initializeInstrumentModel();
			
			//Query instruments for potential selection of ratio, sector and industry group.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
    	},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.isInputValid() == false)
				return;
			
			InstrumentController.createInstrumentByWebService(this.getView().getModel("newInstrument"), this.createInstrumentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},
		
		
		/**
		 * Handles the selection of an instrument type.
		 */
		onTypeSelectionChange : function () {
			var oInstrumentModel;
			var sSelectedType;
			
			oInstrumentModel = this.getView().getModel("newInstrument");
			sSelectedType = oInstrumentModel.getProperty("/type");
			
			if(sSelectedType == Constants.INSTRUMENT_TYPE.STOCK) {
				InstrumentController.setSectorAndIgComboBoxEnabled(true, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));				
			}
			else {				
				InstrumentController.setSectorAndIgComboBoxEnabled(false, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));	
			}
			
			if(sSelectedType == Constants.INSTRUMENT_TYPE.RATIO) {
				this.getView().byId("symbolInput").setValue("");
				this.getView().byId("symbolInput").setEnabled(false);
				this.getView().byId("symbolInput").setRequired(false);
				this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
				this.getView().byId("stockExchangeComboBox").setEnabled(false);
				this.getView().byId("stockExchangeComboBox").setRequired(false);
				this.getView().byId("companyPathInput").setValue("");
				this.getView().byId("companyPathInput").setEnabled(false);
				this.getView().byId("dividendComboBox").setRequired(true);
				this.getView().byId("divisorComboBox").setRequired(true);
				
				oInstrumentModel.setProperty("/stockExchange", null);
				
				InstrumentController.setRatioComboBoxesEnabled(true, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));		
			}
			else {
				this.getView().byId("symbolInput").setEnabled(true);
				this.getView().byId("symbolInput").setRequired(true);
				this.getView().byId("stockExchangeComboBox").setEnabled(true);
				this.getView().byId("stockExchangeComboBox").setRequired(true);
				this.getView().byId("companyPathInput").setEnabled(true);
				this.getView().byId("dividendComboBox").setRequired(false);
				this.getView().byId("divisorComboBox").setRequired(false);
				
				InstrumentController.setRatioComboBoxesEnabled(false, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));	
			}
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
			InstrumentController.setFilterDividendDivisor(
				oCallingController.getView().byId("dividendComboBox"), oCallingController.getView().byId("divisorComboBox"));
			InstrumentController.setFilterSectorIg(
				oCallingController.getView().byId("sectorComboBox"), oCallingController.getView().byId("industryGroupComboBox"));
		},
		
		
		/**
		 * Callback function of the createInstrument RESTful WebService call in the InstrumentController.
		 */
		createInstrumentCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					oCallingController.resetUIElements();
					oCallingController.initializeInstrumentModel();
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
		 * Initializes the instrument model to which the UI controls are bound.
		 */
		initializeInstrumentModel : function () {
			var oInstrumentModel = new JSONModel();
			
			oInstrumentModel.loadData("model/instrument/instrumentCreate.json");
			this.getView().setModel(oInstrumentModel, "newInstrument");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			this.getView().byId("typeComboBox").setSelectedItem(null);
			
			InstrumentController.setSectorAndIgComboBoxEnabled(false, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));
			
			InstrumentController.setRatioComboBoxesEnabled(false, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));
		},
		
		
		/**
		 * Checks if the input is valid. Additionally prompts messages informing the user about missing data.
		 */
		isInputValid : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sType = this.getView().byId("typeComboBox").getSelectedKey();
			
			if(sType == "") {
				MessageBox.error(oResourceBundle.getText("instrumentCreate.noTypeSelected"));
				return false;
			}
			
			if(sType != Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("symbolInput").getValue() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentCreate.noSymbolInput"));
				return false;
			}
			
			if(sType != Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("stockExchangeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentCreate.noStockExchangeSelected"));
				return false;
			}
			
			if(sType == Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("dividendComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentCreate.noDividendSelected"));
				return false;
			}
			
			if(sType == Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("divisorComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentCreate.noDivisorSelected"));
				return false;
			}
			
			return true;
		}
	});
});