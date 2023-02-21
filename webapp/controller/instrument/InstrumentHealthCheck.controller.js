sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, InstrumentController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentHealthCheck", {
		formatter: formatter,


		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("instrumentHealthCheckRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeMinAndMaxDate();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, true);
    	},
    	
    	
    	/**
    	 * Handles the button press event of the refresh health check button.
    	 */
    	onRefreshPressed : function() {
			var bInputValid = this.verifyObligatoryFields();
			var sInstrumentId;
			var sStartDate;
			
			if(bInputValid == false)
				return;
			
			sInstrumentId = this.getView().byId("instrumentComboBox").getSelectedKey();
			sStartDate = this.getView().byId("startDatePicker").getValue();
			
			InstrumentController.checkInstrumentHealthByWebService(this.checkInstrumentHealthCallback, this, true, sInstrumentId, sStartDate);
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
					MessageToast.show(oResourceBundle.getText("instrumentOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
		},
		
		
		/**
		 * Callback function of the checkInstrumentHealth RESTful WebService call in the InstrumentController.
		 */
		checkInstrumentHealthCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("instrumentHealthCheck.checkSuccessful"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "protocolEntries");
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
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			
			//Check if Instrument and date have been selected.
			if(oInstrumentComboBox.getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentHealthCheck.noInstrumentSelected"));
				return false;
			}

			if(oStartDatePicker.getValue() == "") {
				MessageBox.error(oResourceBundle.getText("instrumentHealthCheck.noStartDateSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Initializes the minium and maximum start date of the DatePicker.
		 */
		initializeMinAndMaxDate : function() {
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var dateNow = new Date();
			var dateOneYearAgo = new Date();
			
			dateOneYearAgo.setFullYear(dateNow.getFullYear() - 1);
			
			oStartDatePicker.setMinDate(dateOneYearAgo);
			oStartDatePicker.setMaxDate(dateNow);
		}
	});
});