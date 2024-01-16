sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../scan/ScanController",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, ScanController, Constants, JSONModel, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.ChartPriceVolume", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartPriceVolumeRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeIndicatorComboBox();
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
			var sTitle = oResourceBundle.getText("chartPriceVolume.info.title");
			var sDescription = oResourceBundle.getText("chartPriceVolume.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
		 * Handles the selection of an Instrument.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
	
		},
		
		
		/**
		 * Handles selection of the volume CheckBox.
		 */
		onVolumeCheckBoxSelect : function() {
			
		},
		
		
		/**
		 * Handles selection of an indicator for the price volume chart.
		 */
		onIndicatorSelectionChange : function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oRsInstrumentLabel = this.getView().byId("rsInstrumentLabel");
			var oRsInstrumentComboBox = this.getView().byId("rsInstrumentComboBox");
			
			if(oSelectedItem.getKey() == Constants.CHART_INDICATOR.RS_LINE) {
				oRsInstrumentLabel.setVisible(true);
				oRsInstrumentComboBox.setVisible(true);
				
				this.applyFilterToInstrumentsComboBox(oRsInstrumentComboBox,
					[Constants.INSTRUMENT_TYPE.SECTOR, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.ETF]);
			}
			else {
				oRsInstrumentLabel.setVisible(false);
				oRsInstrumentComboBox.setVisible(false);
			}
		},
		
		
		/**
		 * Handles the button press event of the add object button.
		 */
		onAddObjectPressed : function() {
		
		},
		
		
		/**
		 * Handles the button press event of the edit object button.
		 */
		onEditObjectPressed : function() {
			
		},
		
		
		/**
		 * Handles the button press event of the overview object button.
		 */
		onObjectOverviewPressed : function() {
			
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
		 * Initializes the ComboBox of indicator selection.
		 */
		initializeIndicatorComboBox : function() {
			var oComboBox = this.getView().byId("indicatorComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_INDICATOR.NONE, "chartPriceVolume.indicator.none");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_INDICATOR.RS_LINE, "chartPriceVolume.indicator.rsLine");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_INDICATOR.BBW, "chartPriceVolume.indicator.bbw");
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_INDICATOR.SLOW_STOCHASTIC, "chartPriceVolume.indicator.slowStochastic");	
		},
		
		
		/**
		 * Applies a Filter to the ComboBox for Instrument selection.
		 */
		applyFilterToInstrumentsComboBox : function (oComboxBox, aAllowedInstrumentTypes) {
			var oBinding = oComboxBox.getBinding("items");
			var aFilters = new Array();
			var oFilterType, oFilterTotal;
			
			if(aAllowedInstrumentTypes == undefined || aAllowedInstrumentTypes.length == 0)
				return;
				
			for(var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oFilterType = new Filter("instrument/type", FilterOperator.EQ, aAllowedInstrumentTypes[i]);
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oIndicatorComboBox = this.getView().byId("indicatorComboBox");
			var oRsInstrumentComboBox = this.getView().byId("rsInstrumentComboBox");
			var oRsInstrumentLabel = this.getView().byId("rsInstrumentLabel");
			var oIconTabBar = this.getView().byId("iconTabBar");
			
			var oImage = this.getView().byId("chartImage");

			oInstrumentComboBox.setSelectedKey("");
			oIndicatorComboBox.setSelectedKey("");
			oRsInstrumentComboBox.setSelectedKey("");
			oRsInstrumentComboBox.setVisible(false);
			oRsInstrumentLabel.setVisible(false);
			oIconTabBar.setSelectedKey("price");
			oImage.setSrc(null);
		}
	});
});