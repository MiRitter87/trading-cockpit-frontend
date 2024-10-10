sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"../../scan/ScanController",
	"../../Constants",
	"./ChartAnalysisController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, MainController, ScanController, Constants, ChartAnalysisController, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartPriceVolume", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartPriceVolumeRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTemplateComboBox();
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
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oQuotationsModel = this.getView().getModel("quotations");
			var oInstrument;
			var oVolumeCheckBox = this.getView().byId("volumeCheckBox");
			var oSma30VolumeCheckBox = this.getView().byId("sma30VolumeCheckBox");
			
			if(oSelectedItem == null) {
				return;
			}
			
			oInstrument = ScanController.getInstrumentById(oSelectedItem.getKey(), oQuotationsModel.oData.quotation);
			
			if(oInstrument.type == Constants.INSTRUMENT_TYPE.RATIO) {
				oVolumeCheckBox.setSelected(false);
				oVolumeCheckBox.setEnabled(false);
				oSma30VolumeCheckBox.setSelected(false);
				oSma30VolumeCheckBox.setEnabled(false);
			}
			else {
				oVolumeCheckBox.setSelected(true);
				oVolumeCheckBox.setEnabled(true);
				oSma30VolumeCheckBox.setSelected(true);
				oSma30VolumeCheckBox.setEnabled(true);
			}
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
		 * Handles the selection of a chart template.
		 */
		onTemplateSelectionChange : function() {
			
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
			MessageToast.show(oResourceBundle.getText("chartPriceVolume.getChartError"));
		},
		
		
		/**
		 * Handles selection of the volume CheckBox.
		 */
		onVolumeCheckBoxSelect : function() {
			var oVolumeCheckBox = this.getView().byId("volumeCheckBox");
			var oSma30VolumeCheckBox = this.getView().byId("sma30VolumeCheckBox");
			 
			if(oVolumeCheckBox.getSelected() == true) {				
				oSma30VolumeCheckBox.setEnabled(true);
				oSma30VolumeCheckBox.setSelected(true);
			}
			else {				
				oSma30VolumeCheckBox.setEnabled(false);
				oSma30VolumeCheckBox.setSelected(false);
			}
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
				
				MainController.applyFilterToInstrumentsComboBox(oRsInstrumentComboBox, "instrument/type", 
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
			ChartAnalysisController.onAddObjectPressed(this);
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
			ChartAnalysisController.onObjectOverviewPressed(this);
		},
		
		
		/**
		 * Handles the button press event of the open chart button for chart object coordinate selection.
		 */
		onOpenChartPressed : function() {
			ChartAnalysisController.onOpenChartPressed(this);
		},
		
		
		/**
		 * Handles the button press event of the save button in the "create chart object" dialog.
		 */
		onSaveNewChartObjectPressed : function() {
			ChartAnalysisController.onSaveNewChartObjectPressed(this);
		},
		
		
		/**
		 * Handles the button press event of the cancel button in the "create chart object" dialog.
		 */
		onCancelCreateChartObjectDialog : function() {
			ChartAnalysisController.onCancelCreateChartObjectDialog(this);
		},
		
		
		/**
		 * Handles the button press event of the delete button in the "chart overview" dialog.
		 */
		onDeleteChartObjectPressed : function() {
			ChartAnalysisController.onDeleteChartObjectPressed(this);
		},
		
		
		/**
		 * Handles a click at the take coordinate button of the TradingView chart container.
		 */
		onTakeCoordinate : function() {
			ChartAnalysisController.onTakeCoordinate(this);
		},
		
		
		/**
		 * Handles a click at the cancel button of the TradingView chart container.
		 */
		onCancelChartDialog : function() {
			ChartAnalysisController.onCancelChartDialog(this);
		},
		
		
		/**
		 * Handles a click at the close button of the object overview dialog.
		 */
		onCloseObjectOverviewDialog : function() {
			ChartAnalysisController.onCloseObjectOverviewDialog(this);
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
		 * Initializes the ComboBox of chart template selection.
		 */
		initializeTemplateComboBox : function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TEMPLATE.TREND, "chartPriceVolume.template.trend");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TEMPLATE.BUYABLE_BASE, "chartPriceVolume.template.buyableBase");
				
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TEMPLATE.RS, "chartPriceVolume.template.relativeStrength");
		},
		
		
		/**
		 * Validates the user input. Prompts messages in input is not valid.
		 */
		isInputValid : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			var oIndicatorComboBox = this.getView().byId("indicatorComboBox");
			var sSelectedIndicator = oIndicatorComboBox.getSelectedKey();
			var oRsInstrumentComboBox = this.getView().byId("rsInstrumentComboBox");
			
			if(sSelectedInstrumentId == "") {
				MessageBox.error(oResourceBundle.getText("chartPriceVolume.noInstrumentSelected"));
				return false;
			}
			
			if(sSelectedIndicator == Constants.CHART_INDICATOR.RS_LINE && oRsInstrumentComboBox.getSelectedKey() == "") {	
				MessageBox.error(oResourceBundle.getText("chartPriceVolume.noRsInstrumentSelected"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Determines the URL of the statistic chart based on the selected chart type and optional additional parameters.
		 */
		getChartUrl : function() {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			
			sChartUrl = sChartUrl + "/priceVolume/" + sSelectedInstrumentId + this.getUrlParametersPriceVolume();
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "&randomDate=" + new Date().getTime();
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets the URL parameters for configuration of price volume chart.
		 */
		getUrlParametersPriceVolume : function() {
			var sParameters = "";
			var oEma21CheckBox = this.getView().byId("ema21CheckBox");
			var oSma50CheckBox = this.getView().byId("sma50CheckBox");
			var oSma150CheckBox = this.getView().byId("sma150CheckBox");
			var oSma200CheckBox = this.getView().byId("sma200CheckBox");
			var oVolumeCheckBox = this.getView().byId("volumeCheckBox");
			var oSma30VolumeCheckBox = this.getView().byId("sma30VolumeCheckBox");
			var oIndicatorComboBox = this.getView().byId("indicatorComboBox");
			var sSelectedIndicator = oIndicatorComboBox.getSelectedKey();
			var oRsInstrumentComboBox = this.getView().byId("rsInstrumentComboBox");
			
			if(sSelectedIndicator == "") {
				sParameters = sParameters + "?indicator=NONE";				
			}
			else {
				sParameters = sParameters + "?indicator=" + sSelectedIndicator;
			}
			
			if(oEma21CheckBox.getSelected() == true) {
				sParameters = sParameters + "&overlays=" + Constants.CHART_OVERLAY.EMA_21;
			}
			
			if(oSma50CheckBox.getSelected() == true) {
				sParameters = sParameters + "&overlays=" + Constants.CHART_OVERLAY.SMA_50;
			}
			
			if(oSma150CheckBox.getSelected() == true) {
				sParameters = sParameters + "&overlays=" + Constants.CHART_OVERLAY.SMA_150;
			}
			
			if(oSma200CheckBox.getSelected() == true) {
				sParameters = sParameters + "&overlays=" + Constants.CHART_OVERLAY.SMA_200;
			}
			
			sParameters = sParameters + "&withVolume=" + oVolumeCheckBox.getSelected();
			sParameters = sParameters + "&withSma30Volume=" + oSma30VolumeCheckBox.getSelected();
			
			if(sSelectedIndicator == Constants.CHART_INDICATOR.RS_LINE) {
				sParameters = sParameters + "&rsInstrumentId=" + oRsInstrumentComboBox.getSelectedKey();
			}
			
			return sParameters;
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
			oIconTabBar.setSelectedKey("template");
			oImage.setSrc(null);
		}
	});
});