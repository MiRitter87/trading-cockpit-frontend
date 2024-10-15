sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../scan/ScanController",
	"../list/ListController",
	"../Constants",
	"../../model/formatter",
	"./DashboardController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, ScanController, ListController, Constants, formatter, DashboardController, 
	JSONModel, MessageToast, MessageBox) {
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
			
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			
			this.resetUIElements();
    	},
    	   	
    	
    	/**
    	 * Handles the button press event of the refresh health check button.
    	 */
    	onRefreshPressed : function() {
			var bInputValid = this.verifyObligatoryFields();
			var sInstrumentId;
			var sListId;
			
			if (bInputValid === false) {				
				return;
			}
			
			sInstrumentId = this.getView().byId("instrumentComboBox").getSelectedKey();
			sListId = this.getView().byId("listComboBox").getSelectedKey();
			
			DashboardController.queryMarketHealthStatusByWebService(this.queryHealthStatusCallback, this, true, sInstrumentId, sListId);
		},
    	
    	
    	/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
			MainController.applyFilterToInstrumentsComboBox(oInstrumentComboBox, "instrument/type",
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP]);
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController) {
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
		 * Callback function of the getMarketHealthStatus RESTful WebService call in the DashboardController.
		 */
		queryHealthStatusCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true)
					MessageToast.show(oResourceBundle.getText("dashboardHealthStatus.checkSuccessful"));			
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
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
			if (oInstrumentComboBox.getSelectedKey() === "") {
				MessageBox.error(oResourceBundle.getText("dashboardHealthStatus.noInstrumentSelected"));
				return false;
			}
		},
		
		
		/**
		 * Formatter of the Swingtrading Environment status icon.
		 */
		steIconSrcFormatter : function(sSwingTradingEnvironmentStatus) {
			if (sSwingTradingEnvironmentStatus === 'GREEN') {
				return "sap-icon://status-positive";
			}
			else if (sSwingTradingEnvironmentStatus === 'YELLOW') {
				return "sap-icon://status-critical";
			}
			else if (sSwingTradingEnvironmentStatus === 'RED') {
				return "sap-icon://status-negative";
			}
		},
		
		
		/**
		 * Formatter of the Swingtrading Environment status icon color.
		 */
		steIconColorFormatter : function(sSwingTradingEnvironmentStatus) {
			if (sSwingTradingEnvironmentStatus === 'GREEN') {
				return "green";
			}
			else if (sSwingTradingEnvironmentStatus === 'YELLOW') {
				return "yellow";
			}
			else if (sSwingTradingEnvironmentStatus === 'RED') {
				return "red";
			}
		},
		
		
		/**
		 * Formatter of the visibility of the Distribution Days icon.
		 */
		ddIconVisibleFormatter : function(iDistributionDaysSum) {			
			if (iDistributionDaysSum >= 5) {
				return true;
			}
			else {
				return false;
			}
		},
		
		
		/**
		 * Formatter of the Aggregate Indicator text.
		 */
		aiTextFormatter : function(iAggregateIndicator) {
			//The backend returns -1 if the aggregate indicator could not be determined.
			//In this case don't show any value.
			if (iAggregateIndicator === -1) {
				return "";
			}
			else {
				return iAggregateIndicator;
			}
		},
		
		
		/**
		 * Formatter of the Aggregate Indicator status icon.
		 */
		aiIconSrcFormatter : function(iAggregateIndicator) {
			if (iAggregateIndicator >= 0 && iAggregateIndicator <= 15) {
				return "sap-icon://status-positive";
			}
			else if (iAggregateIndicator >= 85) {
				return "sap-icon://status-negative";
			}
			else {
				return null;
			}
		},

		
		/**
		 * Formatter of the Aggregate Indicator status icon color.
		 */
		aiIconColorFormatter : function(iAggregateIndicator) {
			if (iAggregateIndicator <= 15) {
				return "green";
			}
			else if (iAggregateIndicator >= 85) {
				return "red";
			}
		},
		

		/**
		 * Formatter calculating the percentage of instruments near the 52-week high.
		 */
		percentNear52wHighFormatter : function(iNumberNear52wHigh, iNumberNear52wLow) {
			var iPercentNearHigh;
			
			if (iNumberNear52wHigh === 0 && iNumberNear52wLow === 0) {
				return 0;
			}
			
			iPercentNearHigh = iNumberNear52wHigh /	(iNumberNear52wHigh + iNumberNear52wLow) * 100;
				
			return iPercentNearHigh;
		},
		
		
		/**
		 * Formatter calculating the percentage of instruments near the 52-week low.
		 */
		percentNear52wLowFormatter : function(iNumberNear52wHigh, iNumberNear52wLow) {
			var iPercentNearLow;
			
			if (iNumberNear52wHigh === 0 && iNumberNear52wLow === 0) {
				return 0;
			}
			
			iPercentNearLow = iNumberNear52wLow / (iNumberNear52wHigh + iNumberNear52wLow) * 100;
				
			return iPercentNearLow;
		},
		
		
		/**
		 * Formatter calculating the percentage of instruments trading up on volume.
		 */
		percentUpOnVolumeFormatter : function(iNumberUpOnVolume, iNumberDownOnVolume) {
			var iPercentUpOnVolume;
			
			if (iNumberUpOnVolume === 0 && iNumberDownOnVolume === 0) {
				return 0;
			}
			
			iPercentUpOnVolume = iNumberUpOnVolume / (iNumberUpOnVolume + iNumberDownOnVolume) * 100;
				
			return iPercentUpOnVolume;
		},
		
		
		/**
		 * Formatter calculating the percentage of instruments trading down on volume.
		 */
		percentDownOnVolumeFormatter : function(iNumberUpOnVolume, iNumberDownOnVolume) {
			var iPercentNearLow;
			
			if (iNumberUpOnVolume === 0 && iNumberDownOnVolume === 0) {
				return 0;
			}
			
			iPercentNearLow = iNumberDownOnVolume / (iNumberUpOnVolume + iNumberDownOnVolume) * 100;
				
			return iPercentNearLow;
		},
		 	
    	
    	/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oListComboBox = this.getView().byId("listComboBox");
			var oDistributionDaysIcon = this.getView().byId("distributionDaysIcon");
			var oPi52wHigh = this.getView().byId("pi52wHigh");
			var oPi52wLow = this.getView().byId("pi52wLow");
			var oPiUpOnVolume = this.getView().byId("piUpOnVolume");
			var oPiDownOnVolume = this.getView().byId("piDownOnVolume");
			var oHealthStatus = new JSONModel();
			
			this.getView().setModel(oHealthStatus, "marketHealthStatus");

			oInstrumentComboBox.setSelectedKey("");
			oListComboBox.setSelectedKey("");
			oDistributionDaysIcon.setSrc(null);
			
			// Reset ProgressIndicator
			oPi52wHigh.setPercentValue(0);
			oPi52wLow.setPercentValue(0);
			oPiUpOnVolume.setPercentValue(0);
			oPiDownOnVolume.setPercentValue(0);
		}
	});
});