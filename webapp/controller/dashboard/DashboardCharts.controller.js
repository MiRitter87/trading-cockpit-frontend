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
					
				this.applyFilterToInstrumentsComboBox();
				
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(true);
				oInstrumentComboBox.setVisible(true);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.POCKET_PIVOTS) {
				this.removeFilterFromInstrumentsComboBox();
				
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
				oInstrumentLabel.setVisible(true);
				oInstrumentComboBox.setVisible(true);
			}
			
			oInstrumentComboBox.setSelectedKey(null);
			oListComboBox.setSelectedKey(null);
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
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/statistic");
			var sChartUrl;
			
			if(sSelectedType == "")
				return null;
			
			sChartUrl = sServerAddress + sWebServiceBaseUrl + "/chart?chartType=" + sSelectedType;
			
			if(sSelectedListId != "")
				sChartUrl = sChartUrl + "&listId=" + sSelectedListId;
				
			if(sSelectedInstrumentId != "")
				sChartUrl = sChartUrl + "&instrumentId=" + sSelectedInstrumentId;
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "&randomDate=" + new Date().getTime();
			
			return sChartUrl;
		},
		
		
		/**
		 * Applies a Filter to the ComboBox for Instrument selection.
		 * Only Instruments of Type Sector, Industry Group or ETF are being displayed.
		 */
		applyFilterToInstrumentsComboBox : function () {
			var oBinding = this.getView().byId("instrumentComboBox").getBinding("items");
			var oFilterSector, oFilterIndustryGroup, oFilterEtf, oFilterTotal;
			
			var oFilterSector = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.SECTOR);
			var oFilterIndustryGroup = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP);
			var oFilterEtf = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.ETF);
			
			if(oBinding == undefined)
				return;
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSector, oFilterIndustryGroup, oFilterEtf],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Removes all filters from the ComboBox for Instrument selection.
		 */
		removeFilterFromInstrumentsComboBox : function () {
			var oBinding = this.getView().byId("instrumentComboBox").getBinding("items");
			
			if(oBinding == undefined)
				return;
				
			oBinding.filter([]);
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