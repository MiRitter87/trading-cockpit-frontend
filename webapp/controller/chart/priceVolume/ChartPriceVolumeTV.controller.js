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
		 * Handles the selection of an Instrument.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			//TODO: Only display volume bars, if instrument is not of type RATIO.
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
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var ema21Data = this.getMovingAverageData(Constants.CHART_OVERLAY.EMA_21);
	
			if (oEvent.getSource().getPressed()) {
					const ema21Series = chart.addLineSeries({ color: 'yellow', lineWidth: 1 });
					ema21Series.setData(ema21Data);
					chartModel.setProperty("/ema21Series", ema21Series);
			} else {
				const ema21Series = chartModel.getProperty("/ema21Series");
				
				if(ema21Series !== undefined && chart !== undefined) {
					chart.removeSeries(ema21Series);
				}
			}
		},
		
		
		/**
    	 * Handles the button press event of the SMA(50) ToggleButton.
    	 */
    	onSma50Pressed : function(oEvent) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma50Data = this.getMovingAverageData(Constants.CHART_OVERLAY.SMA_50);
	
			if (oEvent.getSource().getPressed()) {
					const sma50Series = chart.addLineSeries({ color: 'blue', lineWidth: 1 });
					sma50Series.setData(sma50Data);
					chartModel.setProperty("/sma50Series", sma50Series);
			} else {
				const sma50Series = chartModel.getProperty("/sma50Series");
				
				if(sma50Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma50Series);
				}
			}
		},
		
		
				/**
    	 * Handles the button press event of the SMA(150) ToggleButton.
    	 */
    	onSma150Pressed : function(oEvent) {
			var chartModel = this.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma150Data = this.getMovingAverageData(Constants.CHART_OVERLAY.SMA_150);
	
			if (oEvent.getSource().getPressed()) {
					const sma150Series = chart.addLineSeries({ color: 'red', lineWidth: 1 });
					sma150Series.setData(sma150Data);
					chartModel.setProperty("/sma150Series", sma150Series);
			} else {
				const sma150Series = chartModel.getProperty("/sma150Series");
				
				if(sma150Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma150Series);
				}
			}
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
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "quotationsForChart");
			
			oCallingController.openChart();
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
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart : function () {
			var sDivId = "chartContainer";
			var chartModel = new JSONModel();
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(sDivId).innerHTML = "";
	
			const chart = LightweightCharts.createChart(document.getElementById("chartContainer"), {
  				width: document.getElementById("chartContainer").clientWidth,
                height: document.getElementById("chartContainer").clientHeight,
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
                },
            });
            
            const candlestickSeries = chart.addCandlestickSeries();
			candlestickSeries.setData(this.getCandlestickSeries());
			
			const volumeSeries = chart.addHistogramSeries({
				priceFormat: {
        			type: 'volume',
    			},
    			priceScaleId: 'left'
			});	
			volumeSeries.setData(this.getVolumeSeries());
			
			// Customizing the Crosshair
			chart.applyOptions({
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
			        	bottom: 0,
    				},
        			visible: true,
    			}
			});
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			chart.timeScale().fitContent();
			
			//Store chart Model for further access.
			chartModel.setProperty("/chart", chart);
			this.getView().setModel(chartModel, "chartModel");
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
    			if(oQuotation.close >= oQuotation.open) {
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
    			
    			if(oQuotation.movingAverageData === null) {
					continue;
				}
				
				if(sRequestedMA === Constants.CHART_OVERLAY.EMA_21 && oQuotation.movingAverageData.ema21 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.ema21;
				} else if(sRequestedMA === Constants.CHART_OVERLAY.SMA_50 && oQuotation.movingAverageData.sma50 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma50;
				} else if(sRequestedMA === Constants.CHART_OVERLAY.SMA_150 && oQuotation.movingAverageData.sma150 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.sma150;
				}
    			    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oMovingAverageDataset.time = sFormattedDate;
    			
    			aMovingAverageSeries.push(oMovingAverageDataset);
    		}
    		
    		return aMovingAverageSeries;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			var oInstrumentComboBox = this.getView().byId("instrumentComboBox");
			var oEma21Button = this.getView().byId("ema21Button");
			var oSma50Button = this.getView().byId("sma50Button");
			var oSma150Button = this.getView().byId("sma150Button");

			oInstrumentComboBox.setSelectedKey("");
			
			oEma21Button.setPressed(false);
			oSma50Button.setPressed(false);
			oSma150Button.setPressed(false);
			
			//Remove previously created chart.
			document.getElementById("chartContainer").innerHTML = "";
		}
	});
});