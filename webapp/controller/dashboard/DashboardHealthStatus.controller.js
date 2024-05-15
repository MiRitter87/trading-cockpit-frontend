sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../scan/ScanController",
	"../Constants",
	"../../model/formatter",
	"./DashboardController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, ScanController, Constants, formatter, DashboardController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardHealthStatus", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardHealthStatusRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query only instruments that have quotations referenced. Otherwise no health status can be determined.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
			
			this.resetUIElements();
    	},
    	
    	
    	/**
    	 * Handles the button press event of the information button.
    	 */
    	onInfoButtonPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("dashboardHealthStatus.info.title");
			var sDescription = oResourceBundle.getText("dashboardHealthStatus.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
    	
    	
    	/**
    	 * Handles the button press event of the refresh health check button.
    	 */
    	onRefreshPressed : function() {
			var bInputValid = this.verifyObligatoryFields();
			var sInstrumentId;
			
			if(bInputValid == false)
				return;
			
			sInstrumentId = this.getView().byId("instrumentComboBox").getSelectedKey();
			
			DashboardController.queryMarketHealthStatusByWebService(this.queryHealthStatusCallback, this, true, sInstrumentId);
		},
    	
    	
    	/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
			MainController.applyFilterToInstrumentsComboBox(oInstrumentComboBox,
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP]);
		},
		
		
		/**
		 * Callback function of the getMarketHealthStatus RESTful WebService call in the DashboardController.
		 */
		queryHealthStatusCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("dashboardHealthStatus.checkSuccessful"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "marketHealthStatus");
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			
			//Check if Instrument has been selected.
			if(oInstrumentComboBox.getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("dashboardHealthStatus.noInstrumentSelected"));
				return false;
			}
		},
		
		
		/**
		 * Formatter of the Swingtrading Environment status icon.
		 */
		iconSrcFormatter : function(sSwingTradingEnvironmentStatus) {
			if(sSwingTradingEnvironmentStatus == 'GREEN') {
				return "sap-icon://status-positive";
			}
			else if(sSwingTradingEnvironmentStatus == 'YELLOW') {
				return "sap-icon://status-critical";
			}
			else if(sSwingTradingEnvironmentStatus == 'RED') {
				return "sap-icon://status-negative";
			}
		},
		
		
		/**
		 * Formatter of the Swingtrading Environment status icon color.
		 */
		iconColorFormatter : function(sSwingTradingEnvironmentStatus) {
			if(sSwingTradingEnvironmentStatus == 'GREEN') {
				return "green";
			}
			else if(sSwingTradingEnvironmentStatus == 'YELLOW') {
				return "yellow";
			}
			else if(sSwingTradingEnvironmentStatus == 'RED') {
				return "red";
			}
		},
		
		
		/**
		 * Formatter of the visibility of the Distribution Days icon.
		 */
		ddIconVisibleFormatter : function(iDistributionDaysSum) {			
			if(iDistributionDaysSum >= 5) {
				return true;
			}
			else {
				return false;
			}
		},
		
		
		/**
		 * Formatter of the visibility of the Aggregate Indicator icon.
		 */
		aiIconVisibleFormatter : function(iAggregateIndicator) {			
			
		},
			
		
		/**
		 * Formatter of the Tooltip for the Up/Down on Volume StackedBarMicroChart.
		 */
		upDownOnVolumeTooltipFormatter: function(iNumberUp, iNumberDown) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sTooltip = oResourceBundle.getText("dashboardHealthStatus.upDownOnVolume.tooltip", [iNumberUp, iNumberDown]);
			
			return sTooltip;
		},
		
		
		/**
		 * Formatter of the Tooltip for the Near 52 week high/low StackedBarMicroChart.
		 */
		near52wHighLowTooltipFormatter: function(iNumberHigh, iNumberLow) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sTooltip = oResourceBundle.getText("dashboardHealthStatus.nearHighLow.tooltip", [iNumberHigh, iNumberLow]);
			
			return sTooltip;
		},
    	
    	
    	/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oDistributionDaysIcon = this.getView().byId("distributionDaysIcon");
			var oHealthStatus = new JSONModel();
			
			this.getView().setModel(oHealthStatus, "marketHealthStatus");

			oInstrumentComboBox.setSelectedKey("");
			oDistributionDaysIcon.setSrc(null);
		}
	});
});