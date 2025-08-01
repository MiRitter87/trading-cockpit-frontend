sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	"../MainController",
	"./DashboardController",
	"../instrument/InstrumentController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, Constants, MainController, DashboardController, InstrumentController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardStatistic", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardStatisticRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTypeComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query statistic data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DashboardController.queryStatisticsByWebService(this.queryStatisticsCallback, this, true, Constants.INSTRUMENT_TYPE.STOCK);
			
			//Query instruments for selection of sector or industry group.
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
			
			this.resetUIElements();
    	},
    	
    	
    	/**
    	 * Handles the button press event of the refresh statistic button.
    	 */
    	onRefreshPressed: function() {
			var sSelectedType = "";
			var sSectorId;
			var sIndustryGroupId;
			var oInstrument;
			var oInstrumentsModel = this.getView().getModel("instruments");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oSectorIgComboBox = this.getView().byId("sectorIgComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			sSelectedType = oTypeComboBox.getSelectedKey();
			
			if (sSelectedType === "") {				
				MessageBox.error(oResourceBundle.getText("dashboardStatistic.noTypeSelected"));
				return;
			}
			
			oInstrument = InstrumentController.getInstrumentById(Number(oSectorIgComboBox.getSelectedKey()), oInstrumentsModel.oData.instrument);
			
			if (oInstrument === null) {				
				DashboardController.queryStatisticsByWebService(this.queryStatisticsCallback, this, true, sSelectedType);
				return;
			}
			
			if (oInstrument.type === Constants.INSTRUMENT_TYPE.SECTOR) {
				sSectorId = oInstrument.id;
			}
			
			if (oInstrument.type === Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP) {
				sIndustryGroupId = oInstrument.id;
			}
			
			if (sSectorId !== undefined || sIndustryGroupId !== undefined) {				
				DashboardController.queryStatisticsByWebService(
					this.queryStatisticsCallback, this, true, sSelectedType, sSectorId, sIndustryGroupId);
			}
		},
    	
    	
    	/**
		 * Callback function of the queryStatistics RESTful WebService call in the ScanController.
		 */
		queryStatisticsCallback: function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
				
				if (bShowSuccessMessage === true) {					
					MessageToast.show(oResourceBundle.getText("dashboardStatistic.dataLoaded"));			
				}
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "statistics");
		},
		
		
		/**
		 * Callback function of the queryInstruments RESTful WebService call in the InstrumentController.
		 */
		queryInstrumentsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oSectorIgComboBox = oCallingController.getView().byId("sectorIgComboBox");
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "instruments");
			
			MainController.applyFilterToInstrumentsComboBox(oSectorIgComboBox, "type", 
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP]);
		},
		
		
		/**
		 * Initializes the given ComboBox with items for instrument type selection.
		 */
		initializeTypeComboBox: function() {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			//The backend currently only computes statistics for instruments of type stock.
			MainController.addItemToComboBox(oTypeComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.STOCK, "instrument.type.stock");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oSectorIgComboBox = this.getView().byId("sectorIgComboBox");

			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
			oSectorIgComboBox.setSelectedKey("");
		}
	});
});