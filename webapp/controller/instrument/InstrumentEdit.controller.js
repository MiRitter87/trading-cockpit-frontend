sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../list/ListController",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, MainController, InstrumentController, ListController, Constants, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
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
		_onRouteMatched: function() {
			//Query instrument data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
			
			//Query lists for potential selection of data source list.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			
			this.getView().setModel(null, "selectedInstrument");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the instrument ComboBox.
		 */
		onInstrumentSelectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var aInstruments = oInstrumentsModel.getProperty("/instrument");
			var oInstrument, oInstrumentWs;
			
			if (oSelectedItem === null) {
				this.resetUIElements();				
				return;
			}
			
			oInstrument = InstrumentController.getInstrumentById(Number(oSelectedItem.getKey()), aInstruments);
			if (oInstrument !== null) {				
				oInstrumentWs = this.getInstrumentForWebService(oInstrument);
			}
			
			//Set the model of the view according to the selected instrument to allow binding of the UI elements.
			this.getView().setModel(oInstrumentWs, "selectedInstrument");
			
			this.onTypeSelectionChange();
		},
		
		
		/**
		 * Handles the selection of an instrument type.
		 */
		onTypeSelectionChange: function() {
			this.applyTypeRelatedUiSettings();
			this.applyListRelatedUiSettings();
		},
		
		
		/**
		 * Handles the selection of an item in the data source list ComboBox.
		 */
		onListSelectionChange: function() {
			this.applyListRelatedUiSettings();
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed: function() {				
			var bInputValid = this.isInputValid();
			
			if (bInputValid === false) {				
				return;
			}
				
			InstrumentController.saveInstrumentByWebService(this.getView().getModel("selectedInstrument"), this.saveInstrumentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed: function() {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},



		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback: function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("instrumentEdit.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
			InstrumentController.setFilterDividendDivisor(
				oCallingController.getView().byId("dividendComboBox"), oCallingController.getView().byId("divisorComboBox"));
			InstrumentController.setFilterSectorIg(
				oCallingController.getView().byId("sectorComboBox"), oCallingController.getView().byId("industryGroupComboBox"));
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},
				
		
		/**
		 *  Callback function of the saveInstrument RESTful WebService call in the InstrumentController.
		 */
		saveInstrumentCallback: function(oReturnData, oCallingController) {
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					//Update the data source of the ComboBox with the new instrument data.
					InstrumentController.queryInstrumentsByWebService(oCallingController.queryInstrumentsCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedInstrument");
					oCallingController.resetUIElements();
					
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'I') {
					MessageToast.show(oReturnData.message[0].text);
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
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oSelectedInstrument = new JSONModel();
			
			this.getView().byId("instrumentComboBox").setSelectedItem(null);
			this.getView().setModel(oSelectedInstrument, "selectedInstrument");
			
			this.getView().byId("typeComboBox").setSelectedItem(null);			
			
			this.getView().byId("symbolInput").setEnabled(true);
			this.getView().byId("symbolInput").setRequired(true);
			
			this.getView().byId("stockExchangeComboBox").setEnabled(true);
			this.getView().byId("stockExchangeComboBox").setRequired(true);
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			
			this.getView().byId("listComboBox").setEnabled(true);
			this.getView().byId("listComboBox").setSelectedItem(null);
			
			this.getView().byId("investingIdInput").setEnabled(true);
			
			InstrumentController.setSectorAndIgComboBoxEnabled(false, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));
					
			InstrumentController.setRatioComboBoxesEnabled(false, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));	
		},
		
		
		/**
		 * Checks if the input is valid. Additionally prompts messages informing the user about missing data.
		 */
		isInputValid: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sType = this.getView().byId("typeComboBox").getSelectedKey();
			
			
			if (this.getView().byId("instrumentComboBox").getSelectedKey() === "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noInstrumentSelected"));
				return;
			}
			
			if (sType === "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noTypeSelected"));
				return false;
			}
			
			if (sType !== Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("symbolInput").getValue() === "" &&
				this.getView().byId("listComboBox").getSelectedKey() === "") {
					
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noSymbolInput"));
				return false;
			}
			
			if (sType !== Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("stockExchangeComboBox").getSelectedKey() === "" &&
				this.getView().byId("listComboBox").getSelectedKey() === "") {
					
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noStockExchangeSelected"));
				return false;
			}
			
			if (sType === Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("dividendComboBox").getSelectedKey() === "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noDividendSelected"));
				return false;
			}
			
			if (sType === Constants.INSTRUMENT_TYPE.RATIO && this.getView().byId("divisorComboBox").getSelectedKey() === "") {
				MessageBox.error(oResourceBundle.getText("instrumentEdit.noDivisorSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Applies settings of UI elements based on the selected instrument type.
		 */
		applyTypeRelatedUiSettings: function() {
			var oInstrumentModel;
			var sSelectedType;
			
			oInstrumentModel = this.getView().getModel("selectedInstrument");
			
			if (oInstrumentModel === undefined) {				
				return;
			}
			
			sSelectedType = oInstrumentModel.getProperty("/type");
			
			if (sSelectedType === Constants.INSTRUMENT_TYPE.STOCK) {
				InstrumentController.setSectorAndIgComboBoxEnabled(true, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));				
			}
			else {				
				InstrumentController.setSectorAndIgComboBoxEnabled(false, 
					this.getView().byId("sectorComboBox"), this.getView().byId("industryGroupComboBox"));	
			}
			
			if (sSelectedType === Constants.INSTRUMENT_TYPE.ETF || sSelectedType === Constants.INSTRUMENT_TYPE.SECTOR ||
				sSelectedType === Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP) {
				
				this.getView().byId("listComboBox").setEnabled(true);
			} else {
				this.getView().byId("listComboBox").setEnabled(false);
				this.getView().byId("listComboBox").setSelectedItem(null);
			}
			
			if (sSelectedType === Constants.INSTRUMENT_TYPE.RATIO) {
				this.getView().byId("symbolInput").setValue("");
				this.getView().byId("symbolInput").setEnabled(false);
				this.getView().byId("symbolInput").setRequired(false);
				this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
				this.getView().byId("stockExchangeComboBox").setEnabled(false);
				this.getView().byId("stockExchangeComboBox").setRequired(false);
				this.getView().byId("investingIdInput").setValue("");
				this.getView().byId("investingIdInput").setEnabled(false);
				this.getView().byId("dividendComboBox").setRequired(true);
				this.getView().byId("divisorComboBox").setRequired(true);
				
				InstrumentController.setRatioComboBoxesEnabled(true, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));		
			}
			else {
				this.getView().byId("symbolInput").setEnabled(true);
				this.getView().byId("symbolInput").setRequired(true);
				this.getView().byId("stockExchangeComboBox").setEnabled(true);
				this.getView().byId("stockExchangeComboBox").setRequired(true);
				this.getView().byId("investingIdInput").setEnabled(true);
				this.getView().byId("dividendComboBox").setRequired(false);
				this.getView().byId("divisorComboBox").setRequired(false);
				
				InstrumentController.setRatioComboBoxesEnabled(false, 
					this.getView().byId("dividendComboBox"), this.getView().byId("divisorComboBox"));	
			}
		},
		
		
		/**
		 * Applies settings of UI elements based on the selected data source list.
		 */
		applyListRelatedUiSettings: function() {
			var sSelectedType;
			var oSelectedList = this.getView().byId("listComboBox").getSelectedItem();
			var oInstrumentModel = this.getView().getModel("selectedInstrument");
			
			sSelectedType = oInstrumentModel.getProperty("/type");
			
			if (sSelectedType === Constants.INSTRUMENT_TYPE.STOCK || 
				sSelectedType === Constants.INSTRUMENT_TYPE.RATIO) {
					
				return;	//There can be no list defined if type is STOCK or RATIO.
			}
			
			if (oSelectedList === null) {
				this.getView().byId("symbolInput").setEnabled(true);
				this.getView().byId("symbolInput").setRequired(true);
				this.getView().byId("stockExchangeComboBox").setEnabled(true);
				this.getView().byId("stockExchangeComboBox").setRequired(true);
				this.getView().byId("investingIdInput").setEnabled(true);
			} else {
				this.getView().byId("symbolInput").setValue("");
				this.getView().byId("symbolInput").setEnabled(false);
				this.getView().byId("symbolInput").setRequired(false);
				this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
				this.getView().byId("stockExchangeComboBox").setEnabled(false);
				this.getView().byId("stockExchangeComboBox").setRequired(false);
				this.getView().byId("investingIdInput").setValue("");
				this.getView().byId("investingIdInput").setEnabled(false);
			}
		},
		
		
		/**
		 * Creates a representation of an Instrument that can be processed by the WebService.
		 */
		getInstrumentForWebService: function(oInstrument) {
			var oInstrumentWs = new JSONModel();
			
			//Simple attributes
			oInstrumentWs.setProperty("/id", oInstrument.id);
			oInstrumentWs.setProperty("/symbol", oInstrument.symbol);
			oInstrumentWs.setProperty("/type", oInstrument.type);
			oInstrumentWs.setProperty("/stockExchange", oInstrument.stockExchange);
			oInstrumentWs.setProperty("/name", oInstrument.name);
			oInstrumentWs.setProperty("/investingId", oInstrument.investingId);
			
			//References
			if (oInstrument.sector !== null) {				
				oInstrumentWs.setProperty("/sectorId", oInstrument.sector.id);
			}
				
			if (oInstrument.industryGroup !== null) {				
				oInstrumentWs.setProperty("/industryGroupId", oInstrument.industryGroup.id);
			}
				
			if (oInstrument.dividend !== null) {				
				oInstrumentWs.setProperty("/dividendId", oInstrument.dividend.id);
			}
				
			if (oInstrument.divisor !== null) {				
				oInstrumentWs.setProperty("/divisorId", oInstrument.divisor.id);
			}
				
			if (oInstrument.dataSourceList !== null) {				
				oInstrumentWs.setProperty("/dataSourceListId", oInstrument.dataSourceList.id);
			}
			
			return oInstrumentWs;
		}
	});
});