sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"./TradingViewController",
	"../../scan/ScanController",
	"../../instrument/InstrumentController",
	"../../Constants",
	"../../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, TradingViewController, ScanController, InstrumentController, 
	Constants, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartHealthCheckTV", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartHealthCheckTVRoute").attachMatched(this._onRouteMatched, this);
			
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
			var sTitle = oResourceBundle.getText("chartHealthCheckTV.info.title");
			var sDescription = oResourceBundle.getText("chartHealthCheckTV.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sInstrumentId = oInstrumentComboBox.getSelectedKey();
			var sProfile = this.getView().byId("healthCheckProfileComboBox").getSelectedKey();
			var sLookbackPeriod = this.getView().byId("lookbackPeriodInput").getValue();
			
			if (sInstrumentId === "") {
				MessageBox.error(oResourceBundle.getText("chartHealthCheckTV.noInstrumentSelected"));
				return;
			}
			
			this.queryChartData(this.queryChartDataCallback, this, false, sInstrumentId, sProfile, sLookbackPeriod);
		},
		
		
		/**
		 * Handles clicks in the TradingView chart.
		 */
		onChartClicked : function () {
			// No function implemented yet in the context of the health check view.
		},
		
		
		/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
		},
		
		
		/**
		 * Callback function of the queryChartData RESTful WebService call.
		 */
		queryChartDataCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "chartData");
			
			TradingViewController.openChart(oCallingController, "chartContainerHealth");
			TradingViewController.displayHealthCheckEvents(oCallingController, true);
			TradingViewController.setVisibleNumberOfCandles(oCallingController, 100);
		},
		
		
		/**
		 * Queries the chart data WebService for health check data of an Instrument with the given ID.
		 */
		queryChartData : function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId, sProfile, sLookbackPeriod) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chartData");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/healthCheck/" + sInstrumentId;
			
			sQueryUrl = sQueryUrl + "?profile=" + sProfile;
			sQueryUrl = sQueryUrl + "&lookbackPeriod=" + sLookbackPeriod;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});  
		},
		
		
		/**
		 * Initializes the ComboBox of the health check profile.
		 */
		initializeHealthCheckProfileComboBox: function () {
			var oComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.initializeHealthCheckProfileComboBox(oComboBox, oResourceBundle);
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
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oProfileComboBox = this.getView().byId("healthCheckProfileComboBox");
			var oLookbackPeriodInput = this.getView().byId("lookbackPeriodInput");

			oInstrumentComboBox.setSelectedKey("");
			oProfileComboBox.setSelectedKey("");
			oLookbackPeriodInput.setValue("15");
			
			//Remove previously created chart.
			document.getElementById("chartContainerHealth").innerHTML = "";
		}
	});
});