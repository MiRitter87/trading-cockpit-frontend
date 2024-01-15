sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"sap/m/MessageBox"
], function (Controller, MainController, Constants, MessageBox) {
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