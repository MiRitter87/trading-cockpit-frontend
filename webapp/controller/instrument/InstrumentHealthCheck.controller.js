sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../../model/formatter",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, InstrumentController, formatter, Constants, JSONModel, MessageToast, MessageBox) {
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
			this.initializeHealthCheckProfileComboBox();
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
		 * Formatter of the category text.
		 */
		categoryTextFormatter: function(sCategory) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION)
				return oResourceBundle.getText("protocol.category.confirmation");
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION)
				return oResourceBundle.getText("protocol.category.violation");
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN)
				return oResourceBundle.getText("protocol.category.uncertain");
			else
				return "";
		},
		
		
		/**
		 * Formatter of the category icon.
		 */
		categoryIconFormatter: function(sCategory) {
			if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION)
				return "sap-icon://sys-enter-2";
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION)
				return "sap-icon://error";
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN)
				return "sap-icon://alert"
			else
				return "";
		},
		
		
		/**
		 * Formatter of the category state.
		 */
		categoryStateFormatter: function(sCategory) {
			if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION)
				return "Success";
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION)
				return "Error";
			else if(sCategory == Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN)
				return "Warning"
			else
				return "None";
		},
		
		
		/**
		 * Formatter of the profile text.
		 */
		profileTextFormatter: function(sProfile) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(sProfile == Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS)
				return oResourceBundle.getText("protocol.profile.confirmations");
			else if(sProfile == Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH)
				return oResourceBundle.getText("protocol.profile.strength");
			else if(sProfile == Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS)
				return oResourceBundle.getText("protocol.profile.weakness");
			else
				return "";
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
		},
		
		
		/**
		 * Initializes the ComboBox of the health check profile.
		 */
		initializeHealthCheckProfileComboBox: function () {
			var oComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.ALL, "healthCheckProfile.all");
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS, "healthCheckProfile.confirmations");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH, "healthCheckProfile.strength");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS, "healthCheckProfile.weakness");
		}
	});
});