sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../scan/ScanController",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, MainController, ScanController, Constants, JSONModel, MessageBox) {
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oIndicatorComboBox = this.getView().byId("indicatorComboBox");
			var oRsInstrumentComboBox = this.getView().byId("rsInstrumentComboBox");
			var oIconTabBar = this.getView().byId("iconTabBar");
			
			var oImage = this.getView().byId("chartImage");

			oInstrumentComboBox.setSelectedKey("");
			oIndicatorComboBox.setSelectedKey("");
			oRsInstrumentComboBox.setSelectedKey("");
			oIconTabBar.setSelectedKey("price");
			oImage.setSrc(null);
		}
	});
});