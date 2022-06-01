sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, PriceAlertController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertEdit", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertEditRoute").attachMatched(this._onRouteMatched, this);
			
			PriceAlertController.initializeStockExchangeComboBox(this.getView().byId("stockExchangeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
				
			PriceAlertController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query price alert data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			this.getView().setModel(null, "selectedPriceAlert");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the price alert ComboBox.
		 */
		onPriceAlertSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPriceAlertsModel = this.getView().getModel("priceAlerts");
			var oPriceAlert;
			var oPriceAlertModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oPriceAlert = PriceAlertController.getPriceAlertById(oSelectedItem.getKey(), oPriceAlertsModel.oData.priceAlert);
			oPriceAlertModel.setData(oPriceAlert);
			
			//Set the model of the view according to the selected price alert to allow binding of the UI elements.
			this.getView().setModel(oPriceAlertModel, "selectedPriceAlert");
			
			//Manually set the price of the Input field because the price is not directly bound due to validation reasons.
			this.setPriceInputValue(oPriceAlert.price);
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
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				PriceAlertController.initializeDatesAsObject(oModel.oData.priceAlert);
				
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
			
			this.getView().byId("idText").setText("");
			this.getView().byId("symbolInput").setValue("");
			
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			this.getView().byId("typeComboBox").setSelectedItem(null);
			
			this.setPriceInputValue(0);
			this.getView().byId("triggerTimeText").setText("");
			this.getView().byId("confirmationTimeText").setText("");
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
			
			
			if(this.getView().byId("symbolInput").getValue() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noSymbolInput"));
				return false;
			}
			
			if(this.getView().byId("stockExchangeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noStockExchangeSelected"));
				return false;
			}
			
			if(this.getView().byId("typeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("priceAlertEdit.noTypeSelected"));
				return false;
			}
			
			return true;
		}
	});
});