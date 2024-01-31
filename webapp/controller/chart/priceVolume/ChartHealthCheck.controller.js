sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"../../scan/ScanController",
	"../../instrument/InstrumentController",
	"../../Constants",
	"../../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MainController, ScanController, InstrumentController, Constants, formatter, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartHealthCheck", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartHealthCheckRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeHealthCheckProfileComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query only instruments that have quotations referenced. Otherwise no chart could be created.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
			
			this.resetUIElements();
    	},
    	
    	
    	/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("chartHealthCheck.info.title");
			var sDescription = oResourceBundle.getText("chartHealthCheck.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oImage = this.getView().byId("chartImage");
			var bIsInputValid = this.isInputValid();
			var sInstrumentId;
			var sLookbackPeriod;
			var sProfile;
			var sChartUrl;
			
			if(bIsInputValid) {
				sChartUrl = this.getChartUrl();
				oImage.setSrc(sChartUrl);
				
				sInstrumentId = this.getView().byId("instrumentComboBox").getSelectedKey();
				sLookbackPeriod = this.getView().byId("lookbackPeriodInput").getValue();
				sProfile = this.getView().byId("healthCheckProfileComboBox").getSelectedKey();
				InstrumentController.checkHealthWithLookbackPeriodByWebService(this.checkInstrumentHealthCallback, 
					this, true, sInstrumentId, sLookbackPeriod, sProfile);
			}
			else {				
				oImage.setSrc(null);
			}
		},
		
		
		/**
		 * Handles error during loading of the chart image using the given URL.
		 */
		onChartImageError : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oImage = this.getView().byId("chartImage");
			var sImageSrc = oImage.getProperty("src");
			
			if(sImageSrc == "")
				return;		//There was no image to load.
			
			//The backend currently only supports a response with error code 404 and standard error page with response text.
			//The response site would have to be parsed in order to get the message from the backend.
			//Therefore only a generic error message is being displayed at the moment.
			MessageToast.show(oResourceBundle.getText("chartHealthCheck.getChartError"));
		},
		
		
		/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
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
					MessageToast.show(oResourceBundle.getText("chartHealthCheck.checkSuccessful"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "protocolEntries");
		},
		
		
		/**
		 * Initializes the ComboBox of the health check profile.
		 */
		initializeHealthCheckProfileComboBox: function () {
			var oComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS, "healthCheckProfile.confirmations");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH, "healthCheckProfile.strength");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS, "healthCheckProfile.weakness");
		},
		
		
		/**
		 * Validates the user input. Prompts messages in input is not valid.
		 */
		isInputValid : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			var oHealthCheckComboBox = this.getView().byId("healthCheckProfileComboBox");
			var sSelectedProfile = oHealthCheckComboBox.getSelectedKey();
			var oLookbackPeriodInput = this.getView().byId("lookbackPeriodInput");
			var sLookbackPeriod = oLookbackPeriodInput.getValue();
			var iLookbackPeriod = 0;
			
			if(sSelectedInstrumentId == "") {
				MessageBox.error(oResourceBundle.getText("chartHealthCheck.noInstrumentSelected"));
				return false;
			}
			
			if(sSelectedProfile == "") {	
				MessageBox.error(oResourceBundle.getText("chartHealthCheck.noProfileSelected"));
				return false;
			}
			
			if(sLookbackPeriod == "") {
				MessageBox.error(oResourceBundle.getText("chartHealthCheck.lookbackPeriodInvalid"));
				return false;
			}
			
			iLookbackPeriod = parseInt(sLookbackPeriod);
			
			if(isNaN(iLookbackPeriod)) {
				MessageBox.error(oResourceBundle.getText("chartHealthCheck.lookbackPeriodInvalid"));
				return false;
			}
			
			if(iLookbackPeriod < 1 || iLookbackPeriod > 50) {
				MessageBox.error(oResourceBundle.getText("chartHealthCheck.lookbackPeriodInvalid"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Determines the URL of the chart.
		 */
		getChartUrl : function() {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			
			sChartUrl = sChartUrl + "/healthCheck/" + sSelectedInstrumentId + this.getUrlParametersHealthCheck();
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "&randomDate=" + new Date().getTime();
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets the URL parameters for the health check chart.
		 */
		getUrlParametersHealthCheck : function() {
			var sParameters = "";
			var oHealthCheckProfileComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oLookbackPeriodInput = this.getView().byId("lookbackPeriodInput");
			
			sParameters = sParameters + "?profile=" + oHealthCheckProfileComboBox.getSelectedKey();
			sParameters = sParameters + "&lookbackPeriod=" + oLookbackPeriodInput.getValue();
			
			return sParameters;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oHealthCheckComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oLookbackPeriodInput = this.getView().byId("lookbackPeriodInput");
			var oImage = this.getView().byId("chartImage");

			oInstrumentComboBox.setSelectedKey("");
			oHealthCheckComboBox.setSelectedKey("");
			oLookbackPeriodInput.setValue("15");
			oImage.setSrc(null);
		},
		
		
		/**
		 * Formatter of the protocol category text.
		 */
		categoryTextFormatter: function(sCategory) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return InstrumentController.categoryTextFormatter(sCategory, oResourceBundle);
		},
		
		
		/**
		 * Formatter of the protocol category icon.
		 */
		categoryIconFormatter: function(sCategory) {
			return InstrumentController.categoryIconFormatter(sCategory);
		},
		
		
		/**
		 * Formatter of the protocol category state.
		 */
		categoryStateFormatter: function(sCategory) {
			return InstrumentController.categoryStateFormatter(sCategory);
		},
		
		
		/**
		 * Formatter of the health check profile text.
		 */
		profileTextFormatter: function(sProfile) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return InstrumentController.profileTextFormatter(sProfile, oResourceBundle);
		},
	});
});