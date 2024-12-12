sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"../../scan/ScanController",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./lightweight-charts.standalone.production"
], function (Controller, MainController, ScanController, Constants, JSONModel, DateFormat, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartPriceVolumeTV", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartPriceVolumeTVRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query only instruments that have quotations referenced. Otherwise no chart could be created.
			ScanController.queryQuotationsByWebService(this.queryAllQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
			
			this.resetUIElements();
		},
		
		
		/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("chartPriceVolumeTV.info.title");
			var sDescription = oResourceBundle.getText("chartPriceVolumeTV.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (sSelectedInstrumentId === "") {
				MessageBox.error(oResourceBundle.getText("chartPriceVolumeTV.noInstrumentSelected"));
				return;
			}
			
			this.queryQuotationsOfInstrument(this.queryInstrumentQuotationsCallback, this, false, sSelectedInstrumentId);
		},
		
		
		/**
    	 * Handles the button press event of the EMA(21) ToggleButton.
    	 */
    	onEma21Pressed : function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.displayEma21(true);
			} else {
				this.displayEma21(false);
			}
		},
		
		
		/**
    	 * Handles the button press event of the SMA(50) ToggleButton.
    	 */
    	onSma50Pressed : function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.displaySma50(true);
			} else {
				this.displaySma50(false);
			}
		},
		
		
		/**
    	 * Handles the button press event of the SMA(150) ToggleButton.
    	 */
    	onSma150Pressed : function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.displaySma150(true);
			} else {
				this.displaySma150(false);
			}
		},
		
		
		/**
    	 * Handles the button press event of the SMA(200) ToggleButton.
    	 */
    	onSma200Pressed : function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.displaySma200(true);
			} else {
				this.displaySma200(false);
			}
		},
		
		
		/**
    	 * Handles the button press event of the SMA(30) volume ToggleButton.
    	 */
    	onSma30VolumePressed : function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.displaySma30Volume(true);
			} else {
				this.displaySma30Volume(false);
			}
		},
		
		
		/**
		 * Handles clicks in the TradingView chart.
		 */
		onChartClicked : function (param) {
			if (!param.point) {
		        return;
		    }
		    
		    var oHorizontalLineButton = this.getView().byId("horizontalLineButton");
			var oSelectedCoordinateModel = new JSONModel();
		    var oChartModel = this.getView().getModel("chartModel");
		    var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
		    var price = candlestickSeries.coordinateToPrice(param.point.y);
		    
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
		onAcceptCoordinate : function() {
			var oHorizontalLineModel = this.getHorizontalLineModel();
			
			this.createHorizontalLineByWebService(oHorizontalLineModel, this.createHorizontalLineCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button of the horizontal line coordinate PopUp.
		 */
		onCancelCoordinate : function() {
			var oHorizontalLineButton = this.getView().byId("horizontalLineButton");
			
			this.byId("horizontalLineCoordinatesDialog").close();
			oHorizontalLineButton.setPressed(false);
		},
		
		
		/**
		 * Handles the button press event of the overview button.
		 */
		onOverviewPressed : function() {
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
		onCloseObjectOverviewDialog : function() {
			this.byId("chartObjectOverviewDialog").close();
		},
		
		
		/**
		 * Handles the button press event of the delete button in the "chart overview" dialog.
		 */
		onDeleteChartObjectPressed : function() {
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
		queryAllQuotationsCallback : function(oReturnData, oCallingController) {
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
		 * Callback function of the queryQuotationsOfInstrument RESTful WebService call.
		 */
		queryInstrumentQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "quotationsForChart");
			
			oCallingController.openChart();
			oCallingController.setButtonVisibility(true);
			oCallingController.applyMovingAverages();
			
			if (sSelectedInstrumentId !== "") {			
				oCallingController.queryHorizontalLinesByWebService(
					oCallingController.queryHorizontalLinesForDrawingCallback, oCallingController, true, sSelectedInstrumentId);	
			}
		},
		
		
		/**
		 * Callback function of the createHorizontalLine RESTful WebService call.
		 */
		createHorizontalLineCallback : function (oReturnData, oCallingController) {
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
		queryHorizontalLinesCallback : function(oReturnData, oCallingController) {
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
		queryHorizontalLinesForDrawingCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);
				oCallingController.drawHorizontalLines(oModel);	
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
		},
		
		
		/**
		 * Callback function of the deleteHorizontalLine RESTful WebService call.
		 */
		deleteHorizontalLineCallback : function(oReturnData, oCallingController) {
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
		 * Queries the quotation WebService for quotations of an Instrument with the given ID.
		 */
		queryQuotationsOfInstrument : function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/quotation");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + sInstrumentId;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});  
		},
		
		
		/**
		 * Calls a WebService operation to create a horizontal line object.
		 */
		createHorizontalLineByWebService : function(oHorizontalLineModel, callbackFunction, oCallingController) {
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
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the chartObject WebService for horizontal lines.
		 */
		queryHorizontalLinesByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentId) {
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
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Deletes the given horizontal line using the WebService.
		 */
		deleteHorizontalLineByWebService : function(oHorizontalLine, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oHorizontalLine.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart : function () {
			var sDivId = "chartContainer";
			var oChartModel = new JSONModel();
			var bIsInstrumentTypeRatio = this.isInstrumentTypeRatio();
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(sDivId).innerHTML = "";
	
			const chart = LightweightCharts.createChart(document.getElementById("chartContainer"), {
  				width: document.getElementById("chartContainer").clientWidth,
                height: document.getElementById("chartContainer").clientHeight,
            });
            
            const candlestickSeries = chart.addCandlestickSeries({ priceLineVisible: false });
			candlestickSeries.setData(this.getCandlestickSeries());
			
			if (bIsInstrumentTypeRatio === false) {
				const volumeSeries = chart.addHistogramSeries({
					priceFormat: {
	        			type: 'volume',
	    			},
	    			priceScaleId: 'left'
				});	
				volumeSeries.setData(this.getVolumeSeries());				
			}
			
			this.applyChartOptions(chart, bIsInstrumentTypeRatio);
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			chart.timeScale().fitContent();
			
			//Handle clicks in the chart. The controller needs to be bound to access the data model within the handler.
			chart.subscribeClick(this.onChartClicked.bind(this));
			
			//Store chart Model for further access.
			oChartModel.setProperty("/chart", chart);
			oChartModel.setProperty("/candlestickSeries", candlestickSeries)
			this.getView().setModel(oChartModel, "chartModel");
		},
		
		
		/**
		 * Applies options to the given chart.
		 */
		applyChartOptions : function(oChart, bIsInstrumentTypeRatio) {
			oChart.applyOptions({
    			crosshair: {
			        // Change mode from default 'magnet' to 'normal'.
			        // Allows the crosshair to move freely without snapping to datapoints
			        mode: LightweightCharts.CrosshairMode.Normal
    			},
    			rightPriceScale: {
					mode: LightweightCharts.PriceScaleMode.Logarithmic,
					scaleMargins: {
				        top: 0.05,
				        bottom: 0.15,
				    },
				    visible: true
				},
				leftPriceScale: {
					scaleMargins: {
			        	top: 0.85,
			        	bottom: 0
			        }
	    		},
    			layout: {
                    backgroundColor: 'white',
                    textColor: 'black',
                },
                grid: {
                    vertLines: {
                        color: '#eee',
                    },
                    horzLines: {
                        color: '#eee',
                    },
                }
			});
			
			if (bIsInstrumentTypeRatio === true) {
				oChart.applyOptions({
					leftPriceScale: { visible: false }
				});
			} else {
				oChart.applyOptions({
					leftPriceScale: { visible: true	}
				});
			}
		},
		
		
		/**
		 * Creates a candlestick series that contains the data to be displayed.
		 */
		getCandlestickSeries : function () {
			var oQuotationsModel = this.getView().getModel("quotationsForChart");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aCandlestickSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "YYYY-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
    			var oCandlestickDataset = new Object();
    			
    			oCandlestickDataset.open = oQuotation.open;
    			oCandlestickDataset.high = oQuotation.high;
    			oCandlestickDataset.low = oQuotation.low;
    			oCandlestickDataset.close = oQuotation.close;
    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oCandlestickDataset.time = sFormattedDate;
    			
    			aCandlestickSeries.push(oCandlestickDataset);
			}
			
			return aCandlestickSeries;
		},
		
		
		/**
		 * Creates a Histogram series that contains the volume data to be displayed.
		 */
		getVolumeSeries : function () {
			var oQuotationsModel = this.getView().getModel("quotationsForChart");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aVolumeSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "YYYY-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
    			var oVolumeDataset = new Object();
    			
    			oVolumeDataset.value = oQuotation.volume;
    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oVolumeDataset.time = sFormattedDate;
    			
    			//Determine color of volume bars
    			if (oQuotation.close >= oQuotation.open) {
					oVolumeDataset.color = 'green';
				} else {
					oVolumeDataset.color = 'red';
				}
    			
    			aVolumeSeries.push(oVolumeDataset);
    		}
    		
    		return aVolumeSeries;
		},
		
		
		/**
		 * Create a line series that contains the data of the requested moving average.
		 */
		getMovingAverageData : function (sRequestedMA) {
			var oQuotationsModel = this.getView().getModel("quotationsForChart");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aMovingAverageSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "YYYY-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
    			var oMovingAverageDataset = new Object();
    			
    			if (oQuotation.movingAverageData === null) {
					continue;
				}
				
				if (sRequestedMA === Constants.CHART_OVERLAY.EMA_21 && oQuotation.movingAverageData.ema21 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.ema21;
				} else if (sRequestedMA === Constants.CHART_OVERLAY.SMA_50 && oQuotation.movingAverageData.sma50 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma50;
				} else if (sRequestedMA === Constants.CHART_OVERLAY.SMA_150 && oQuotation.movingAverageData.sma150 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma150;
				} else if (sRequestedMA === Constants.CHART_OVERLAY.SMA_200 && oQuotation.movingAverageData.sma200 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma200;
				} else if (sRequestedMA === "SMA_30_VOLUME" && oQuotation.movingAverageData.sma30Volume !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma30Volume;
				}
    			    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oMovingAverageDataset.time = sFormattedDate;
    			
    			aMovingAverageSeries.push(oMovingAverageDataset);
    		}
    		
    		return aMovingAverageSeries;
		},
		
		
		/**
		 * Applies the moving averages to the chart according to the state of the ToggleButtons.
		 */
		applyMovingAverages : function() {
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");
			var oSma200Button = this.getView().byId("sma200Button");
			var oSma30VolumeButton = this.getView().byId("sma30VolumeButton");
			
			this.displayEma21(oEma21Button.getPressed());
			this.displaySma50(oSma50Button.getPressed());
			this.displaySma150(oSma150Button.getPressed());
			this.displaySma200(oSma200Button.getPressed());
			this.displaySma30Volume(oSma30VolumeButton.getPressed());
		},
		
		
		/**
		 * Displays the EMA(21) in the chart.
		 */
		displayEma21 : function (bVisible) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var ema21Data = this.getMovingAverageData(Constants.CHART_OVERLAY.EMA_21);
	
			if (bVisible === true) {
				const ema21Series = chart.addLineSeries({ color: 'yellow', lineWidth: 1, priceLineVisible: false });
				ema21Series.setData(ema21Data);
				chartModel.setProperty("/ema21Series", ema21Series);
			} else {
				const ema21Series = chartModel.getProperty("/ema21Series");
				
				if (ema21Series !== undefined && chart !== undefined) {
					chart.removeSeries(ema21Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(50) in the chart.
		 */
		displaySma50 : function (bVisible) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma50Data = this.getMovingAverageData(Constants.CHART_OVERLAY.SMA_50);
	
			if (bVisible === true) {
				const sma50Series = chart.addLineSeries({ color: 'blue', lineWidth: 1, priceLineVisible: false });
				sma50Series.setData(sma50Data);
				chartModel.setProperty("/sma50Series", sma50Series);
			} else {
				const sma50Series = chartModel.getProperty("/sma50Series");
				
				if (sma50Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma50Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(150) in the chart.
		 */
		displaySma150 : function (bVisible) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma150Data = this.getMovingAverageData(Constants.CHART_OVERLAY.SMA_150);
	
			if (bVisible === true) {
				const sma150Series = chart.addLineSeries({ color: 'red', lineWidth: 1, priceLineVisible: false });
				sma150Series.setData(sma150Data);
				chartModel.setProperty("/sma150Series", sma150Series);
			} else {
				const sma150Series = chartModel.getProperty("/sma150Series");
				
				if (sma150Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma150Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(200) in the chart.
		 */
		displaySma200 : function (bVisible) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma200Data = this.getMovingAverageData(Constants.CHART_OVERLAY.SMA_200);
	
			if (bVisible === true) {
				const sma200Series = chart.addLineSeries({ color: 'green', lineWidth: 1, priceLineVisible: false });
				sma200Series.setData(sma200Data);
				chartModel.setProperty("/sma200Series", sma200Series);
			} else {
				const sma200Series = chartModel.getProperty("/sma200Series");
				
				if (sma200Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma200Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(30) of the volume in the chart.
		 */
		displaySma30Volume : function (bVisible) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma30VolumeData = this.getMovingAverageData("SMA_30_VOLUME");
	
			if (bVisible === true) {
				const sma30VolumeSeries = chart.addLineSeries(
					{ color: 'black', lineWidth: 1, priceLineVisible: false, priceScaleId: 'left' }
				);
				sma30VolumeSeries.setData(sma30VolumeData);
				chartModel.setProperty("/sma30VolumeSeries", sma30VolumeSeries);
			} else {
				const sma30VolumeSeries = chartModel.getProperty("/sma30VolumeSeries");
				
				if (sma30VolumeSeries !== undefined && chart !== undefined) {
					chart.removeSeries(sma30VolumeSeries);
				}
			}
		},
		
		
		/**
		 * Draws horizontal lines to the TradingView chart.
		 */
		drawHorizontalLines : function(oHorizontalLines) {
			var aHorizontalLines = oHorizontalLines.oData.horizontalLine;
			var oChartModel = this.getView().getModel("chartModel");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
						
			for (var i = 0; i < aHorizontalLines.length; i++) {
				var oHorizontalLine = aHorizontalLines[i];
				
				const priceLine = { price: oHorizontalLine.price, color: 'black', lineWidth: 1, lineStyle: 0 };
				oCandlestickSeries.createPriceLine(priceLine);
			}
		},
		
		
		/**
		 * Sets the visibility of the chart buttons.
		 */
		setButtonVisibility : function(bVisible) {
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");
			var oSma200Button = this.getView().byId("sma200Button");
			var oSma30VolumeButton = this.getView().byId("sma30VolumeButton");
			var oHorizontalLineButton = this.getView().byId("horizontalLineButton");
			var oOverviewButton = this.getView().byId("overviewButton");
			
			oEma21Button.setVisible(bVisible);
			oSma50Button.setVisible(bVisible);
			oSma150Button.setVisible(bVisible);
			oSma200Button.setVisible(bVisible);
			oSma30VolumeButton.setVisible(bVisible);
			oHorizontalLineButton.setVisible(bVisible);
			oOverviewButton.setVisible(bVisible);
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");
			var oSma200Button = this.getView().byId("sma200Button");
			var oSma30VolumeButton = this.getView().byId("sma30VolumeButton");

			oInstrumentComboBox.setSelectedKey("");
			
			oEma21Button.setPressed(false);
			oSma50Button.setPressed(false);
			oSma150Button.setPressed(false);
			oSma200Button.setPressed(false);
			oSma30VolumeButton.setPressed(false);
			
			this.setButtonVisibility(false);
			
			//Remove previously created chart.
			document.getElementById("chartContainer").innerHTML = "";
		},
		
		
		/**
		 * Gets the HorizontalLine as JSONModel that can be further processed by the WebService.
		 */
		getHorizontalLineModel : function () {
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
		getSelectedHorizontalLine : function () {
			var oListItem = this.getView().byId("chartObjectTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("horizontalLines");
			var oSelectedHorizontalLine = oContext.getProperty(null, oContext);
			
			return oSelectedHorizontalLine;
		},
		
		
		/**
		 * Checks if the instrument for which quotations have been loaded is of type RATIO.
		 */
		isInstrumentTypeRatio : function () {
			var oQuotationsModel = this.getView().getModel("quotationsForChart");
			var oQuotations = oQuotationsModel.oData.quotation;
			var oQuotation;
			
			if(oQuotations.length === 0) {
				return false;
			}
			
			oQuotation = oQuotations[0];
				
			if (oQuotation.instrument.type === Constants.INSTRUMENT_TYPE.RATIO) {
				return true;
			} else {
				return false;
			}
		}
	});
});