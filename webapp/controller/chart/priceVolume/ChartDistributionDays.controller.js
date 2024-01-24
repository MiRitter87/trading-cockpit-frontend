sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"../ChartController",
	"../../scan/ScanController",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MainController, ChartController, ScanController, Constants, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartDistributionDays", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartDistributionDaysRoute").attachMatched(this._onRouteMatched, this);
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
			var sTitle = oResourceBundle.getText("chartDistributionDays.info.title");
			var sDescription = oResourceBundle.getText("chartDistributionDays.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oImage = this.getView().byId("chartImage");
			var bIsInputValid = this.isInputValid();
			var sChartUrl;
			
			if(bIsInputValid) {
				sChartUrl = this.getChartUrl();
				oImage.setSrc(sChartUrl);
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
			MessageToast.show(oResourceBundle.getText("chartDistributionDays.getChartError"));
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
			ChartController.applyFilterToInstrumentsComboBox(oInstrumentComboBox,
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.ETF]);
		},
		
		
		/**
		 * Validates the user input. Prompts messages in input is not valid.
		 */
		isInputValid : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if(sSelectedInstrumentId == "") {
				MessageBox.error(oResourceBundle.getText("chartDistributionDays.noInstrumentSelected"));
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
			
			sChartUrl = sChartUrl + "/distributionDays/" + sSelectedInstrumentId;
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "?randomDate=" + new Date().getTime();
			
			return sChartUrl;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oImage = this.getView().byId("chartImage");

			oInstrumentComboBox.setSelectedKey("");
			oImage.setSrc(null);
		}
	});
});