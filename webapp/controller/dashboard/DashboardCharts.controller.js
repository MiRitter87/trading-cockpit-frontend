sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"../list/ListController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, Constants, ListController, InstrumentController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardCharts", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardChartsRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTypeComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			InstrumentController.queryInstrumentsByWebService(this.queryInstrumentsCallback, this, false);
			
			this.resetUIElements();
    	},
		
		
		/**
		 * Handles the selection of a chart type.
		 */
		onTypeSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oListLabel = this.getView().byId("listLabel");
			var oListComboBox = this.getView().byId("listComboBox");
			var oInstrumentLabel = this.getView().byId("instrumentLabel");
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			
			if(oSelectedItem == null) {
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(false);
				oInstrumentComboBox.setVisible(false);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER || 
				oSelectedItem.getKey() == Constants.CHART_TYPE.INSTRUMENTS_ABOVE_SMA50 || 
				oSelectedItem.getKey() == Constants.CHART_TYPE.RITTER_MARKET_TREND || 
				oSelectedItem.getKey() == Constants.CHART_TYPE.RITTER_PATTERN_INDICATOR) {
					
				oListLabel.setVisible(true);
				oListComboBox.setVisible(true);
				oInstrumentLabel.setVisible(false);
				oInstrumentComboBox.setVisible(false);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.DISTRIBUTION_DAYS ||
				oSelectedItem.getKey() == Constants.CHART_TYPE.FOLLOW_THROUGH_DAYS) {
				
				this.applyFilterToInstrumentsComboBox(
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.ETF]);
				
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(true);
				oInstrumentComboBox.setVisible(true);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.POCKET_PIVOTS) {
				this.applyFilterToInstrumentsComboBox(
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, 
					 Constants.INSTRUMENT_TYPE.STOCK, Constants.INSTRUMENT_TYPE.ETF]);
				
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(true);
				oInstrumentComboBox.setVisible(true);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.PRICE_VOLUME) {
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(true);
				oInstrumentComboBox.setVisible(true);
			}
			
			oInstrumentComboBox.setSelectedKey(null);
			oListComboBox.setSelectedKey(null);
		},
		
		
		/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = "", sDescription = "";
			var sKey = "";
			
			sKey = oComboBox.getSelectedKey();
			
			if(sKey == Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.advanceDeclineNumber");
				sDescription = oResourceBundle.getText("dashboardCharts.type.advanceDeclineNumber.description");
			}
			else if(sKey == Constants.CHART_TYPE.INSTRUMENTS_ABOVE_SMA50) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.instrumentsAboveSma50");
				sDescription = oResourceBundle.getText("dashboardCharts.type.instrumentsAboveSma50.description");
			}
			else if(sKey == Constants.CHART_TYPE.DISTRIBUTION_DAYS) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.distributionDays");
				sDescription = oResourceBundle.getText("dashboardCharts.type.distributionDays.description");
			}
			else if(sKey == Constants.CHART_TYPE.FOLLOW_THROUGH_DAYS) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.followThroughDays");
				sDescription = oResourceBundle.getText("dashboardCharts.type.followThroughDays.description");
			}
			else if(sKey == Constants.CHART_TYPE.RITTER_MARKET_TREND) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.ritterMarketTrend");
				sDescription = oResourceBundle.getText("dashboardCharts.type.ritterMarketTrend.description");
			}
			else if(sKey == Constants.CHART_TYPE.RITTER_PATTERN_INDICATOR) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.ritterPatternIndicator");
				sDescription = oResourceBundle.getText("dashboardCharts.type.ritterPatternIndicator.description");
			}
			else if(sKey == Constants.CHART_TYPE.POCKET_PIVOTS) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.pocketPivots");
				sDescription = oResourceBundle.getText("dashboardCharts.type.pocketPivots.description");
			}
			else if(sKey == Constants.CHART_TYPE.PRICE_VOLUME) {
				sTitle = oResourceBundle.getText("dashboardCharts.type.priceVolume");
				sDescription = oResourceBundle.getText("dashboardCharts.type.priceVolume.description");
			}
			else {
				MessageBox.information(oResourceBundle.getText("dashboardCharts.noTypeSelected"));
				return;
			}		
			
			mOptions.title = sTitle
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oImage = this.getView().byId("chartImage");
			var bIsInputValid = this.isInputValid();
			var sChartUrl;
			var sSelectedType = "";
			var oTypeComboBox = this.getView().byId("typeComboBox");
			
			sSelectedType = oTypeComboBox.getSelectedKey();
			
			if(sSelectedType == "") {
				MessageBox.information(oResourceBundle.getText("dashboardCharts.noTypeSelected"));
				return;				
			}
			
			if(bIsInputValid) {
				sChartUrl = this.getChartUrl();
				oImage.setSrc(sChartUrl);
			}
			else {				
				oImage.setSrc(null);
			}
			
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);		
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},
		
		
		/**
		 * Handles error during loading of the chart image using the given URL.
		 */
		onChartImageError : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			//The backend currently only supports a response with error code 404 and standard error page with response text.
			//The response site would have to be parsed in order to get the message from the backend.
			//Therefore only a generic error message is being displayed at the moment.
			MessageToast.show(oResourceBundle.getText("dashboardCharts.getChartError"));
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
		 * Initializes the ComboBox of chart type.
		 */
		initializeTypeComboBox : function () {
			var oComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER, "dashboardCharts.type.advanceDeclineNumber");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.INSTRUMENTS_ABOVE_SMA50, "dashboardCharts.type.instrumentsAboveSma50");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.DISTRIBUTION_DAYS, "dashboardCharts.type.distributionDays");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.FOLLOW_THROUGH_DAYS, "dashboardCharts.type.followThroughDays");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.RITTER_MARKET_TREND, "dashboardCharts.type.ritterMarketTrend");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.RITTER_PATTERN_INDICATOR, "dashboardCharts.type.ritterPatternIndicator");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.POCKET_PIVOTS, "dashboardCharts.type.pocketPivots");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.PRICE_VOLUME, "dashboardCharts.type.priceVolume");
		},
		
		
		/**
		 * Determines the URL of the statistic chart based on the selected chart type and optional additional parameters.
		 */
		getChartUrl : function() {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oListComboBox = this.getView().byId("listComboBox");
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedType = oTypeComboBox.getSelectedKey();
			var sSelectedListId = oListComboBox.getSelectedKey();
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			
			if(sSelectedType == "")
				return null;
			else if(sSelectedType == Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER) {
				sChartUrl = sChartUrl + "/cumulativeADNumber";
			}
			else if(sSelectedType == Constants.CHART_TYPE.INSTRUMENTS_ABOVE_SMA50) {
				sChartUrl = sChartUrl + "/instrumentsAboveSma50";
			}
			else if(sSelectedType == Constants.CHART_TYPE.DISTRIBUTION_DAYS) {
				sChartUrl = sChartUrl + "/distributionDays/" + sSelectedInstrumentId;
			}
			else if(sSelectedType == Constants.CHART_TYPE.FOLLOW_THROUGH_DAYS) {
				sChartUrl = sChartUrl + "/followThroughDays/" + sSelectedInstrumentId;
			}
			else if(sSelectedType == Constants.CHART_TYPE.RITTER_MARKET_TREND) {
				sChartUrl = sChartUrl + "/ritterMarketTrend";
			}
			else if(sSelectedType == Constants.CHART_TYPE.RITTER_PATTERN_INDICATOR) {
				sChartUrl = sChartUrl + "/ritterPatternIndicator";
			}
			else if(sSelectedType == Constants.CHART_TYPE.POCKET_PIVOTS) {
				sChartUrl = sChartUrl + "/pocketPivots/" + sSelectedInstrumentId;
			}
			else if(sSelectedType == Constants.CHART_TYPE.PRICE_VOLUME) {
				sChartUrl = sChartUrl + "/priceVolume/" + sSelectedInstrumentId;
			}
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "?randomDate=" + new Date().getTime();
			
			if(sSelectedListId != "")
				sChartUrl = sChartUrl + "&listId=" + sSelectedListId;
			
			return sChartUrl;
		},
		
		
		/**
		 * Applies a Filter to the ComboBox for Instrument selection.
		 */
		applyFilterToInstrumentsComboBox : function (aAllowedInstrumentTypes) {
			var oBinding = this.getView().byId("instrumentComboBox").getBinding("items");
			var aFilters = new Array();
			var oFilterType, oFilterTotal;
			
			if(aAllowedInstrumentTypes == undefined || aAllowedInstrumentTypes.length == 0)
				return;
				
			for(var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oFilterType = new Filter("type", FilterOperator.EQ, aAllowedInstrumentTypes[i]);
				aFilters.push(oFilterType);
			}
			
			if(oBinding == undefined)
				return;
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: aFilters,
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Validates the user input. Prompts messages in input is not valid.
		 */
		isInputValid : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var sSelectedType = oTypeComboBox.getSelectedKey();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if(	sSelectedType == Constants.CHART_TYPE.DISTRIBUTION_DAYS && sSelectedInstrumentId == "" || 
				sSelectedType == Constants.CHART_TYPE.FOLLOW_THROUGH_DAYS && sSelectedInstrumentId == "" ||
				sSelectedType == Constants.CHART_TYPE.POCKET_PIVOTS && sSelectedInstrumentId == "") {
					
				MessageBox.error(oResourceBundle.getText("dashboardCharts.noInstrumentSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oListLabel = this.getView().byId("listLabel");
			var oListComboBox = this.getView().byId("listComboBox");
			var oInstrumentLabel = this.getView().byId("instrumentLabel");
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oImage = this.getView().byId("chartImage");
			
			oListLabel.setVisible(false);
			oListComboBox.setVisible(false);
			oInstrumentLabel.setVisible(false);
			oInstrumentComboBox.setVisible(false);
			
			this.getView().byId("typeComboBox").setSelectedKey("");
			this.getView().byId("listComboBox").setSelectedKey("");
			this.getView().byId("instrumentComboBox").setSelectedKey("");
			
			oImage.setSrc(null);
		}
	});
});