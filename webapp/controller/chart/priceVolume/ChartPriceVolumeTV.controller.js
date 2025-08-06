sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./TradingViewController",
	"../../MainController",
	"../../scan/ScanController",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./lightweight-charts.standalone.production"
], function(Controller, TradingViewController, MainController, ScanController, Constants, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartPriceVolumeTV", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartPriceVolumeTVRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query only instruments that have quotations referenced. Otherwise no chart could be created.
			ScanController.queryQuotationsByWebService(this.queryAllQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
			
			this.resetUIElements();
		},
		
		
		/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oOptions = new Object();
			var sTitle = oResourceBundle.getText("chartPriceVolumeTV.info.title");
			var sDescription = oResourceBundle.getText("chartPriceVolumeTV.info.description");
			
			oOptions.title = sTitle;
			MessageBox.information(sDescription, oOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (sSelectedInstrumentId === "") {
				MessageBox.error(oResourceBundle.getText("chartPriceVolumeTV.noInstrumentSelected"));
				return;
			}
			
			this.queryChartData(this.queryChartDataCallback, this, false, sSelectedInstrumentId);
		},
		
		
		/**
    	 * Handles the button press event of the EMA(21) ToggleButton.
    	 */
    	onEma21Pressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
	
			if (oEvent.getSource().getPressed()) {
				oChartModel.setProperty("/displayEma21", true);
			} else {
				oChartModel.setProperty("/displayEma21", false);
			}
			
			TradingViewController.displayEma21(this);
		},
		
		
		/**
    	 * Handles the button press event of the SMA(50) ToggleButton.
    	 */
    	onSma50Pressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
	
			if (oEvent.getSource().getPressed()) {
				oChartModel.setProperty("/displaySma50", true);
			} else {
				oChartModel.setProperty("/displaySma50", false);
			}
			
			TradingViewController.displaySma50(this);
		},
		
		
		/**
    	 * Handles the button press event of the SMA(150) ToggleButton.
    	 */
    	onSma150Pressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
	
			if (oEvent.getSource().getPressed()) {
				oChartModel.setProperty("/displaySma150", true);
			} else {
				oChartModel.setProperty("/displaySma150", false);
			}
			
			TradingViewController.displaySma150(this);
		},
		
		
		/**
    	 * Handles the button press event of the SMA(200) ToggleButton.
    	 */
    	onSma200Pressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
			
			if (oEvent.getSource().getPressed()) {
				oChartModel.setProperty("/displaySma200", true);
			} else {
				oChartModel.setProperty("/displaySma200", false);
			}
			
			TradingViewController.displaySma200(this);
		},
		
		
		/**
    	 * Handles the button press event of the SMA(30) volume ToggleButton.
    	 */
    	onSma30VolumePressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
			
			if (oEvent.getSource().getPressed()) {
				oChartModel.setProperty("/displaySma30Volume", true);
			} else {
				oChartModel.setProperty("/displaySma30Volume", false);
			}
			
			TradingViewController.displaySma30Volume(this);
		},
		
		
		/**
		 * Handles the button press event of the Bollinger BandWidth ToggleButton.
		 */
		onBollingerBandWidthPressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
			var oSlowStoButton = this.getView().byId("slowStochasticButton");
			var oRsLineButton = this.getView().byId("rsLineButton");
			
			if (oEvent.getSource().getPressed()) {
				if (oSlowStoButton.getPressed() === true) {
					oSlowStoButton.setPressed(false);
					oChartModel.setProperty("/displaySlowStochastic", false);
					TradingViewController.displaySlowStochastic(this);
				}
				
				if (oRsLineButton.getPressed() === true) {
					oRsLineButton.setPressed(false);
					oChartModel.setProperty("/displayRsLine", false);
					TradingViewController.displayRsLine(this);
				}
				
				oChartModel.setProperty("/displayBollingerBandWidth", true);
			} else {
				oChartModel.setProperty("/displayBollingerBandWidth", false);
			}
			
			TradingViewController.displayBollingerBandWidth(this);
		},
		
		
		/**
		 * Handles the button press event of the Slow Stochastic ToggleButton.
		 */
		onSlowStochasticPressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
			var oBBWButton = this.getView().byId("bbwButton");
			var oRsLineButton = this.getView().byId("rsLineButton");
			
			if (oEvent.getSource().getPressed()) {
				if (oBBWButton.getPressed() === true) {
					oBBWButton.setPressed(false);
					oChartModel.setProperty("/displayBollingerBandWidth", false);
					TradingViewController.displayBollingerBandWidth(this);
				}
				
				if (oRsLineButton.getPressed() === true) {
					oRsLineButton.setPressed(false);
					oChartModel.setProperty("/displayRsLine", false);
					TradingViewController.displayRsLine(this);
				}
				
				oChartModel.setProperty("/displaySlowStochastic", true);
			} else {
				oChartModel.setProperty("/displaySlowStochastic", false);
			}
			
			TradingViewController.displaySlowStochastic(this);
		},
		
		
		/**
		 * Handles the button press event of the RS line ToggleButton.
		 */
		onRsLinePressed: function(oEvent) {
			var oChartModel = this.getView().getModel("chartModel");
			var oSlowStoButton = this.getView().byId("slowStochasticButton");
			var oBBWButton = this.getView().byId("bbwButton");
			
			if (oEvent.getSource().getPressed()) {
				if (oSlowStoButton.getPressed() === true) {
					oSlowStoButton.setPressed(false);
					oChartModel.setProperty("/displaySlowStochastic", false);
					TradingViewController.displaySlowStochastic(this);
				}
				
				if (oBBWButton.getPressed() === true) {
					oBBWButton.setPressed(false);
					oChartModel.setProperty("/displayBollingerBandWidth", false);
					TradingViewController.displayBollingerBandWidth(this);
				}
				
				oChartModel.setProperty("/displayRsLine", true);
			} else {
				oChartModel.setProperty("/displayRsLine", false);
			}
			
			TradingViewController.displayRsLine(this);
		},
		
		
		/**
		 * Handles clicks in the TradingView chart.
		 */
		onChartClicked: function(param) {
			if (!param.point) {
		        return;
		    }
		    
		    var oHorizontalLineButton = this.getView().byId("horizontalLineButton");
			var oSelectedCoordinateModel = new JSONModel();
		    var oChartModel = this.getView().getModel("chartModel");
		    var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
		    var price = oCandlestickSeries.coordinateToPrice(param.point.y);
		    
		    if (oHorizontalLineButton.getPressed() === true) {
				//Write selected price to JSONModel and bind model to view.
				oSelectedCoordinateModel.setProperty("/price", price.toFixed(2));
				oSelectedCoordinateModel.setProperty("/date", param.time);
				this.getView().setModel(oSelectedCoordinateModel, "selectedCoordinates");
				
				MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.chart.priceVolume.HorizontalLineCoordinates");
			} else {
				return;
			}
		},
		
		
		/**
		 * Handles accepting the selected coordinate for the horizontal line.
		 */
		onAcceptCoordinate: function() {
			var oHorizontalLineModel = this.getHorizontalLineModel();
			
			this.createHorizontalLineByWebService(oHorizontalLineModel, this.createHorizontalLineCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button of the horizontal line coordinate PopUp.
		 */
		onCancelCoordinate: function() {
			var oHorizontalLineButton = this.getView().byId("horizontalLineButton");
			
			this.byId("horizontalLineCoordinatesDialog").close();
			oHorizontalLineButton.setPressed(false);
		},
		
		
		/**
		 * Handles the button press event of the overview button.
		 */
		onOverviewPressed: function() {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (sSelectedInstrumentId === "") {
				this.queryHorizontalLinesByWebService(this.queryHorizontalLinesCallback, this, true);				
			}
			else {
				this.queryHorizontalLinesByWebService(this.queryHorizontalLinesCallback, this, true, sSelectedInstrumentId);	
			}
		},
		
		
		/**
		 * Handles a click at the close button of the object overview dialog.
		 */
		onCloseObjectOverviewDialog: function() {
			this.byId("chartObjectOverviewDialog").close();
		},
		
		
		/**
		 * Handles the button press event of the delete button in the "chart overview" dialog.
		 */
		onDeleteChartObjectPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (this.getView().byId("chartObjectTable").getSelectedItem() === null) {
				MessageBox.information(oResourceBundle.getText("chartPriceVolumeTV.objectOverviewDialog.noObjectSelected"));
				return;				
			}
			
			this.deleteHorizontalLineByWebService(this.getSelectedHorizontalLine(), this.deleteHorizontalLineCallback, this);
		},
		
		
		/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryAllQuotationsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
		},
		
		
		/**
		 * Callback function of the queryChartData RESTful WebService call.
		 */
		queryChartDataCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "chartData");
			
			TradingViewController.openChart(oCallingController, "chartContainerPV");
			oCallingController.updateToolbarForChartDisplay();
			oCallingController.updateModelForOverlays();
			TradingViewController.applyIndicators(oCallingController);
			TradingViewController.applyMovingAverages(oCallingController);
			
			if (sSelectedInstrumentId !== "") {			
				oCallingController.queryHorizontalLinesByWebService(
					oCallingController.queryHorizontalLinesForDrawingCallback, oCallingController, true, sSelectedInstrumentId);	
			}
		},
		
		
		/**
		 * Callback function of the createHorizontalLine RESTful WebService call.
		 */
		createHorizontalLineCallback: function(oReturnData, oCallingController) {
			var oHorizontalLineButton = oCallingController.getView().byId("horizontalLineButton");
			
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					
					oCallingController.byId("horizontalLineCoordinatesDialog").close();
					oHorizontalLineButton.setPressed(false);
				}
				
				if (oReturnData.message[0].type === 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Callback function of the queryHorizontalLines RESTful WebService call.
		 * This callback function is used in the context of the object overview dialog.
		 */
		queryHorizontalLinesCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oOverviewDialog = oCallingController.byId("chartObjectOverviewDialog");
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "horizontalLines");
			
			if (oOverviewDialog === undefined || oOverviewDialog.isOpen() === false) {
				MainController.openFragmentAsPopUp(oCallingController, "trading-cockpit-frontend.view.chart.priceVolume.ChartObjectOverview");				
			}
		},
		
		
		/**
		 * Callback function of the queryHorizontalLines RESTful WebService call.
		 * This callback function is used to draw horizontal lines in the TradingView chart.
		 */
		queryHorizontalLinesForDrawingCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				TradingViewController.drawHorizontalLines(oCallingController, oModel);	
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
		},
		
		
		/**
		 * Callback function of the deleteHorizontalLine RESTful WebService call.
		 */
		deleteHorizontalLineCallback: function(oReturnData, oCallingController) {
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (oReturnData.message !== null) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
					
					if (sSelectedInstrumentId === "") {
						oCallingController.queryHorizontalLinesByWebService(
							oCallingController.queryHorizontalLinesCallback, oCallingController, true);				
					}
					else {
						oCallingController.queryHorizontalLinesByWebService(
							oCallingController.queryHorizontalLinesCallback, oCallingController, true, sSelectedInstrumentId);	
					}
				}
				
				if (oReturnData.message[0].type === 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Queries the chart data WebService for price/volume data of an Instrument with the given ID.
		 */
		queryChartData: function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chartData");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/priceVolume/" + sInstrumentId;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});  
		},
		
		
		/**
		 * Calls a WebService operation to create a horizontal line object.
		 */
		createHorizontalLineByWebService: function(oHorizontalLineModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oHorizontalLineModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the chartObject WebService for horizontal lines.
		 */
		queryHorizontalLinesByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			if (sInstrumentId !== undefined && sInstrumentId !== null) {				
				sQueryUrl= sQueryUrl + "?instrumentId=" + sInstrumentId;
			}
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Deletes the given horizontal line using the WebService.
		 */
		deleteHorizontalLineByWebService: function(oHorizontalLine, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oHorizontalLine.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");
			var oSma200Button = this.getView().byId("sma200Button");
			var oSma30VolumeButton = this.getView().byId("sma30VolumeButton");
			var oBBWButton = this.getView().byId("bbwButton");
			var oSlowStoButton = this.getView().byId("slowStochasticButton");
			var oRsLineButton = this.getView().byId("rsLineButton");
			var oChartToolbar = this.getView().byId("chartToolbar");

			oInstrumentComboBox.setSelectedKey("");
			
			oEma21Button.setPressed(false);
			oSma50Button.setPressed(false);
			oSma150Button.setPressed(false);
			oSma200Button.setPressed(false);
			oSma30VolumeButton.setPressed(false);
			oBBWButton.setPressed(false);
			oSlowStoButton.setPressed(false);
			oRsLineButton.setPressed(false);
			
			oChartToolbar.setVisible(false);
			
			//Remove previously created chart.
			document.getElementById("chartContainerPV").innerHTML = "";
		},
		
		
		/**
		 * Gets the HorizontalLine as JSONModel that can be further processed by the WebService.
		 */
		getHorizontalLineModel: function() {
			var oHorizontalLineWS = new JSONModel();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oSelectedCoordinateModel = this.getView().getModel("selectedCoordinates");
			
			oHorizontalLineWS.setProperty("/instrumentId", oInstrumentComboBox.getSelectedKey());
			oHorizontalLineWS.setProperty("/price", oSelectedCoordinateModel.getProperty("/price"));
			
			return oHorizontalLineWS;
		},
		
		
		/**
		 * Gets the the selected horizontal line from the overview table.
		 */
		getSelectedHorizontalLine: function() {
			var oListItem = this.getView().byId("chartObjectTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("horizontalLines");
			var oSelectedHorizontalLine = oContext.getProperty(null, oContext);
			
			return oSelectedHorizontalLine;
		},
		
		
		/**
		 * Updates the toolbar for chart display. 
		 */
		updateToolbarForChartDisplay: function() {
			var oChartToolbar = this.getView().byId("chartToolbar");
			var oToolbarTitle = this.getView().byId("toolbarTitle");
			var oRsLineButton = this.getView().byId("rsLineButton");
			var oQuotationsModel = this.getView().getModel("chartData");
			var aQuotations = oQuotationsModel.getProperty("/quotations/quotation");
			var oQuotation;

			// Set title
			if (aQuotations.length > 0) {
				oQuotation = aQuotations[0];
				oToolbarTitle.setText(oQuotation.instrument.name);
			} else {
				return;
			}
			
			oChartToolbar.setVisible(true);
			
			// Disable RS-Line button for non-stocks.
			if (oQuotation.instrument.type === Constants.INSTRUMENT_TYPE.STOCK) {
				oRsLineButton.setEnabled(true);
			} else {
				oRsLineButton.setPressed(false);
				oRsLineButton.setEnabled(false);
			}
		},
		
		
		/**
		 * Updates the chartModel with visibility information about moving averages and indicators.
		 */
		updateModelForOverlays: function() {
			this.updateModelForMovingAverages();
			this.updateModelForIndicators();
		},
		
		
		/**
		 * Updates the chartModel with visibility information about moving averages.
		 */
		updateModelForMovingAverages: function() {
			var oChartModel = this.getView().getModel("chartModel");
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");
			var oSma200Button = this.getView().byId("sma200Button");
			var oSma30VolumeButton = this.getView().byId("sma30VolumeButton");
			
			if (oEma21Button.getPressed()) {
				oChartModel.setProperty("/displayEma21", true);
			} else {
				oChartModel.setProperty("/displayEma21", false);
			}
			
			if (oSma50Button.getPressed()) {
				oChartModel.setProperty("/displaySma50", true);
			} else {
				oChartModel.setProperty("/displaySma50", false);
			}
			
			if (oSma150Button.getPressed()) {
				oChartModel.setProperty("/displaySma150", true);
			} else {
				oChartModel.setProperty("/displaySma150", false);
			}
			
			if (oSma200Button.getPressed()) {
				oChartModel.setProperty("/displaySma200", true);
			} else {
				oChartModel.setProperty("/displaySma200", false);
			}
			
			if (oSma30VolumeButton.getPressed()) {
				oChartModel.setProperty("/displaySma30Volume", true);
			} else {
				oChartModel.setProperty("/displaySma30Volume", false);
			}
		},
		
		/**
		 * Updates the chartModel with visibility information about indicators.
		 */
		updateModelForIndicators: function() {
			var oChartModel = this.getView().getModel("chartModel");
			var oBBWButton = this.getView().byId("bbwButton");
			var oSlowStoButton = this.getView().byId("slowStochasticButton");
			var oRsLineButton = this.getView().byId("rsLineButton");
			
			if (oBBWButton.getPressed()) {
				oChartModel.setProperty("/displayBollingerBandWidth", true);
			} else {
				oChartModel.setProperty("/displayBollingerBandWidth", false);
			}
			
			if (oSlowStoButton.getPressed()) {
				oChartModel.setProperty("/displaySlowStochastic", true);
			} else {
				oChartModel.setProperty("/displaySlowStochastic", false);
			}
			
			if (oRsLineButton.getPressed()) {
				oChartModel.setProperty("/displayRsLine", true);
			} else {
				oChartModel.setProperty("/displayRsLine", false);
			}
		}
	});
});