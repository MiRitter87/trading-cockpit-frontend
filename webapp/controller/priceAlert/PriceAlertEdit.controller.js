sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./PriceAlertController",
	"../instrument/InstrumentController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, PriceAlertController, InstrumentController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertEdit", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertEditRoute").attachMatched(this._onRouteMatched, this);
				
			PriceAlertController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query price alert data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			//Query instruments for instrument selection dialog.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
			
			this.getView().setModel(null, "selectedPriceAlert");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the price alert ComboBox.
		 */
		onPriceAlertSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPriceAlertsModel = this.getView().getModel("priceAlerts");
			var oPriceAlert, wsPriceAlert;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oPriceAlert = PriceAlertController.getPriceAlertById(oSelectedItem.getKey(), oPriceAlertsModel.oData.priceAlert);
			if(oPriceAlert != null)
				wsPriceAlert = PriceAlertController.getPriceAlertForWebService(oPriceAlert);
			
			//Set the model of the view according to the selected price alert to allow binding of the UI elements.
			this.getView().setModel(wsPriceAlert, "selectedPriceAlert");
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oPriceAlert.price);
			
			if(oPriceAlert.triggerTime != null)
				this.enableInputFields(false);
			else
				this.enableInputFields(true);
		},
		
		
		/**
		 * Handles the selection of an item in the instrument ComboBox.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var oInstrument;
			var sCurrency = "";
			var oPriceAlertModel;
			
			//Check if a price alert has been selected.
			if(this.getView().byId("priceAlertComboBox").getSelectedKey() == "") {
				return;
			}
			
			//Get the selected instrument.
			if(oSelectedItem != null) {			
				oInstrument = InstrumentController.getInstrumentById(oSelectedItem.getKey(), oInstrumentsModel.oData.instrument);				
			} else {
				return;
			}
			
			//Determine the currency based on the stock exchange of the instrument.
			sCurrency = PriceAlertController.getCurrencyForStockExchange(oInstrument.stockExchange);
			
			//Set the currency of the new price alert.
			oPriceAlertModel = this.getView().getModel("selectedPriceAlert");
			oPriceAlertModel.setProperty("/currency", sCurrency);
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {				
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			PriceAlertController.savePriceAlertByWebService(this.getView().getModel("selectedPriceAlert"), this.savePriceAlertCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},
		
		
		/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "instruments");
		},


		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("priceAlertEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 *  Callback function of the savePriceAlert RESTful WebService call in the PriceAlertController.
		 */
		savePriceAlertCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new priceAlert data.
					PriceAlertController.queryPriceAlertsByWebService(oCallingController.queryPriceAlertsCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedPriceAlert");
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
		 * Sets the value of the priceInput.
		 */
		setPriceInputValue : function(fValue) {
			this.getView().byId("priceInput").setValue(fValue);
			this.getView().byId("priceInput").setValueState(sap.ui.core.ValueState.None);
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("priceAlertComboBox").setSelectedItem(null);
			this.getView().setModel(null, "selectedPriceAlert");
			
			this.getView().byId("idText").setText("");	
			this.getView().byId("instrumentComboBox").setSelectedItem(null);	
			this.getView().byId("typeComboBox").setSelectedItem(null);
			
			this.setPriceInputValue(0);
			this.getView().byId("triggerDistancePercentText").setText("");
			this.getView().byId("triggerTimeText").setText("");
			this.getView().byId("confirmationTimeText").setText("");
			
			this.getView().byId("sendMailCheckBox").setSelected(false);
			this.getView().byId("alertMailAddressInput").setValue("");
			this.getView().byId("mailTransmissionTimeText").setText("");
			
			this.enableInputFields(false);
		},
		
		
		/**
		 * Enables or disables the Input fields of the form
		 */
		enableInputFields : function (bEnabled) {
			this.getView().byId("instrumentComboBox").setEnabled(bEnabled);	
			this.getView().byId("typeComboBox").setEnabled(bEnabled);
			this.getView().byId("priceInput").setEnabled(bEnabled);
			
			this.getView().byId("sendMailCheckBox").setEnabled(bEnabled);
			this.getView().byId("alertMailAddressInput").setEnabled(bEnabled);
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.getView().byId("priceAlertComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noPriceAlertSelected"));
				return;
			}
			
			//Validate price first to remove the error indication from the input field as soon as possible if the user fills in correct data.
			PriceAlertController.validatePriceInput(this.getView().byId("priceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("selectedPriceAlert"), "/price");
			
			if(PriceAlertController.isPriceValid(this.getView().byId("priceInput").getValue()) == false)
				return false;
			
			if(this.getView().byId("instrumentComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noInstrumentSelected"));
				return false;
			}
			
			if(this.getView().byId("typeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noTypeSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Formatter of the currency display text.
		 */
		currencyTextFormatter: function(sCurrencyCode) {
			return PriceAlertController.getCurrencyDisplayText(sCurrencyCode);
		}
	});
});