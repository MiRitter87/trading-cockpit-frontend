sap.ui.define([
	"./TradingViewHelper",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"./lightweight-charts.standalone.production"
], function(TradingViewHelper, Constants, JSONModel, DateFormat) {
	"use strict";
	return {
		/**
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart: function(oCallingController, sChartContainerDivId) {
			var oChartModel = new JSONModel();
			var bIsInstrumentTypeRatio = this.isInstrumentTypeRatio(oCallingController);
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(sChartContainerDivId).innerHTML = "";
	
			const oChart = LightweightCharts.createChart(document.getElementById(sChartContainerDivId), {
  				width: document.getElementById(sChartContainerDivId).clientWidth,
                height: document.getElementById(sChartContainerDivId).clientHeight,
                autoSize: true
            });
            
            const oCandlestickSeries = oChart.addSeries(LightweightCharts.CandlestickSeries, { priceLineVisible: false });
			oCandlestickSeries.setData(this.getCandlestickSeries(oCallingController));
			
			if (bIsInstrumentTypeRatio === false) {
				const oVolumeSeries = oChart.addSeries(LightweightCharts.HistogramSeries, {
					priceFormat: {
	        			type: 'volume',
	    			},
	    			priceScaleId: 'left',
	    			priceLineVisible: false
				});	
				oVolumeSeries.setData(this.getVolumeSeries(oCallingController));	
				
				oChartModel.setProperty("/volumeSeries", oVolumeSeries);			
			}
			
			this.applyChartOptions(oChart, bIsInstrumentTypeRatio);
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			oChart.timeScale().fitContent();
			
			//Handle clicks in the chart. The controller needs to be bound to access the data model within the handler.
			oChart.subscribeClick(oCallingController.onChartClicked.bind(oCallingController));
			
			//Store chart Model for further access.
			oChartModel.setProperty("/chart", oChart);
			oChartModel.setProperty("/candlestickSeries", oCandlestickSeries);
			oCallingController.getView().setModel(oChartModel, "chartModel");
		},
		
		
		/**
		 * Creates a candlestick series that contains the data to be displayed.
		 */
		getCandlestickSeries: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var aCandlestickSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
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
		getVolumeSeries: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var aVolumeSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
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
		 * Applies options to the given chart.
		 */
		applyChartOptions: function(oChart, bIsInstrumentTypeRatio) {
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
		 * Applies the moving averages to the chart according to the state of the chartModel.
		 */
		applyMovingAverages: function(oCallingController) {
			this.displayEma21(oCallingController);
			this.displaySma50(oCallingController);
			this.displaySma150(oCallingController);
			this.displaySma200(oCallingController);
			this.displaySma30Volume(oCallingController);
		},
		
		
		/**
		 * Applies the indicators to the chart according to the state of the chartModel.
		 */
		applyIndicators: function(oCallingController) {
			this.displayBollingerBandWidth(oCallingController);
			this.displaySlowStochastic(oCallingController);
			this.displayRsLine(oCallingController);
		},
		
		
		/**
		 * Displays the EMA(21) in the chart.
		 */
		displayEma21: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aEma21Data = TradingViewHelper.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.EMA_21);
			var bIsEma21Visible = oChartModel.getProperty("/displayEma21");
	
			if (bIsEma21Visible === true) {
				const oEma21Series = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'yellow', lineWidth: 1, priceLineVisible: false });
				oEma21Series.setData(aEma21Data);
				oChartModel.setProperty("/ema21Series", oEma21Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const oEma21Series = oChartModel.getProperty("/ema21Series");
				
				if (oEma21Series !== undefined && oChart !== undefined) {
					oChart.removeSeries(oEma21Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(50) in the chart.
		 */
		displaySma50: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aSma50Data = TradingViewHelper.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_50);
			var bIsSma50Visible = oChartModel.getProperty("/displaySma50");
	
			if (bIsSma50Visible === true) {
				const oSma50Series = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'blue', lineWidth: 1, priceLineVisible: false });
				oSma50Series.setData(aSma50Data);
				oChartModel.setProperty("/sma50Series", oSma50Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const oSma50Series = oChartModel.getProperty("/sma50Series");
				
				if (oSma50Series !== undefined && oChart !== undefined) {
					oChart.removeSeries(oSma50Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(150) in the chart.
		 */
		displaySma150: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aSma150Data = TradingViewHelper.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_150);
			var bIsSma150Visible = oChartModel.getProperty("/displaySma150");
	
			if (bIsSma150Visible === true) {
				const oSma150Series = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'red', lineWidth: 1, priceLineVisible: false });
				oSma150Series.setData(aSma150Data);
				oChartModel.setProperty("/sma150Series", oSma150Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const oSma150Series = oChartModel.getProperty("/sma150Series");
				
				if (oSma150Series !== undefined && oChart !== undefined) {
					oChart.removeSeries(oSma150Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(200) in the chart.
		 */
		displaySma200: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aSma200Data = TradingViewHelper.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_200);
			var bIsSma200Visible = oChartModel.getProperty("/displaySma200");
	
			if (bIsSma200Visible === true) {
				const oSma200Series = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'green', lineWidth: 1, priceLineVisible: false });
				oSma200Series.setData(aSma200Data);
				oChartModel.setProperty("/sma200Series", oSma200Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const oSma200Series = oChartModel.getProperty("/sma200Series");
				
				if (oSma200Series !== undefined && oChart !== undefined) {
					oChart.removeSeries(oSma200Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(30) of the volume in the chart.
		 */
		displaySma30Volume: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aSma30VolumeData = TradingViewHelper.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_30_VOLUME);
			var bIsSma30VolumeVisible = oChartModel.getProperty("/displaySma30Volume");
	
			if (bIsSma30VolumeVisible === true) {
				const oSma30VolumeSeries = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, priceScaleId: 'left' }
				);
				oSma30VolumeSeries.setData(aSma30VolumeData);
				oChartModel.setProperty("/sma30VolumeSeries", oSma30VolumeSeries);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const oSma30VolumeSeries = oChartModel.getProperty("/sma30VolumeSeries");
				
				if (oSma30VolumeSeries !== undefined && oChart !== undefined) {
					oChart.removeSeries(oSma30VolumeSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Bollinger BandWidth in a separate pane of the chart.
		 */
		displayBollingerBandWidth: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aBbwData;
			var fBbwThreshold = this.getBBWThreshold(oCallingController);
			var bIsBbwVisible = oChartModel.getProperty("/displayBollingerBandWidth");
			
			if (bIsBbwVisible === true) {
				aBbwData = TradingViewHelper.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.BBW);
				
				const oBbwSeries = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				oBbwSeries.setData(aBbwData);
				
				//Draw horizontal trigger line
				const oPriceLine = { price: fBbwThreshold, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				oBbwSeries.createPriceLine(oPriceLine);
				
				oChartModel.setProperty("/bbwSeries", oBbwSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const oBbwSeries = oChartModel.getProperty("/bbwSeries");
				
				if (oBbwSeries !== undefined && oChart !== undefined) {
					oChart.removeSeries(oBbwSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Slow Stochastic in a separate pane of the chart.
		 */
		displaySlowStochastic: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aSlowStochasticData;
			var bIsSlowStochasticVisible = oChartModel.getProperty("/displaySlowStochastic");
			
			if (bIsSlowStochasticVisible === true) {
				aSlowStochasticData = TradingViewHelper.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.SLOW_STOCHASTIC);
				
				const oSlowStochasticSeries = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				oSlowStochasticSeries.setData(aSlowStochasticData);
				
				//Draw horizontal trigger lines
				const priceLineTop = { price: 85, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				oSlowStochasticSeries.createPriceLine(priceLineTop);
				const priceLineMid = { price: 50, color: 'black', lineWidth: 1, lineStyle: 2, axisLabelVisible: false };
				oSlowStochasticSeries.createPriceLine(priceLineMid);
				const priceLineBot = { price: 15, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				oSlowStochasticSeries.createPriceLine(priceLineBot);
				
				oChartModel.setProperty("/slowStochasticSeries", oSlowStochasticSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const oSlowStochasticSeries = oChartModel.getProperty("/slowStochasticSeries");
				
				if (oSlowStochasticSeries !== undefined && oChart !== undefined) {
					oChart.removeSeries(oSlowStochasticSeries);
				}
			}
		},
		
		
		/**
		 * Displays the RS line in a separate pane of the chart.
		 */
		displayRsLine: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var oRsLineData;
			var bIsRsLineVisible = oChartModel.getProperty("/displayRsLine");
			
			if (bIsRsLineVisible === true) {
				oRsLineData = TradingViewHelper.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.RS_LINE);
				
				const oRsLineSeries = oChart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				oRsLineSeries.setData(oRsLineData);
				
				
				oChartModel.setProperty("/rsLineSeries", oRsLineSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const oRsLineSeries = oChartModel.getProperty("/rsLineSeries");
				
				if (oRsLineSeries !== undefined && oChart !== undefined) {
					oChart.removeSeries(oRsLineSeries);
				}
			}
		},
		
		
		/**
		 * Displays a Histogram with the net sum of health check events for each trading day.
		 */
		displayHealthCheckEvents: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var aHealthEventData;
			var bAreEventsVisible = oChartModel.getProperty("/displayHealthCheckEvents");
			
			if (bAreEventsVisible === true) {
				aHealthEventData = TradingViewHelper.getHealthEventData(oCallingController);
				
				const oHealthEventSeries = oChart.addSeries(LightweightCharts.HistogramSeries,
					{ color: 'blue', priceLineVisible: false}
				);
				oHealthEventSeries.setData(aHealthEventData);
				
				oChartModel.setProperty("/healthEventSeries", oHealthEventSeries);
				
				this.organizePanesHealthCheck(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const oHealthEventSeries = oChartModel.getProperty("/healthEventSeries");
				
				if (oHealthEventSeries !== undefined && oChart !== undefined) {
					oChart.removeSeries(oHealthEventSeries);
				}
			}
		},
		
		
		/**
		 * Organizes the panes of the price/volume chart in a manner that 
		 * the indicator is at the top pane and the price/volume pane is below.
		 */
		organizePanesPriceVolume: function(oChartModel) {
			var oChart = oChartModel.getProperty("/chart");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
			var oVolumeSeries = oChartModel.getProperty("/volumeSeries");
			var oBbwSeries = oChartModel.getProperty("/bbwSeries");
			var oSlowStochasticSeries = oChartModel.getProperty("/slowStochasticSeries");
			var oRsLineSeries = oChartModel.getProperty("/rsLineSeries");
			var oIndicatorPane;
			var chartHeight;
			
			if (oChartModel.getProperty("/displayBollingerBandWidth") === true) {	
				oBbwSeries.moveToPane(0);
				oCandlestickSeries.moveToPane(1);
				oVolumeSeries.moveToPane(1);
				
				oBbwSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			}
			
			if (oChartModel.getProperty("/displaySlowStochastic") === true) {	
				oSlowStochasticSeries.moveToPane(0);
				oCandlestickSeries.moveToPane(1);
				oVolumeSeries.moveToPane(1);
				
				oSlowStochasticSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			}
			
			if (oChartModel.getProperty("/displayRsLine") === true) {	
				oRsLineSeries.moveToPane(0);
				oCandlestickSeries.moveToPane(1);
				oVolumeSeries.moveToPane(1);
				
				oRsLineSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
			}
			
			chartHeight = oChart.options().height;
			oIndicatorPane = oChart.panes()[0];
			oIndicatorPane.setHeight(chartHeight * 0.15);
			
			oCandlestickSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
		},
		
		
		/**
		 * Organizes the panes of the health check chart in a manner that
		 * the indicator is at the top pane and the price/volume pane is below.
		 */
		organizePanesHealthCheck: function(oChartModel) {
			var oChart = oChartModel.getProperty("/chart");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
			var oVolumeSeries = oChartModel.getProperty("/volumeSeries");
			var oHealthEventSeries = oChartModel.getProperty("/healthEventSeries");
			var oIndicatorPane;
			var chartHeight;
			
			oHealthEventSeries.moveToPane(0);
			oCandlestickSeries.moveToPane(1);
			oVolumeSeries.moveToPane(1);
			oHealthEventSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			oCandlestickSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
			
			chartHeight = oChart.options().height;
			oIndicatorPane = oChart.panes()[0];
			oIndicatorPane.setHeight(chartHeight * 0.15);
		},
		
		
		/**
		 * Moves the moving averages to the target pane depending on the visibility of any indicator.
		 */
		organizeMovingAverages: function(oChartModel) {
			var oChart = oChartModel.getProperty("/chart");
			var oEma21Series = oChartModel.getProperty("/ema21Series");
			var oSma50Series = oChartModel.getProperty("/sma50Series");
			var oSma150Series = oChartModel.getProperty("/sma150Series");
			var oSma200Series = oChartModel.getProperty("/sma200Series");
			var oSma30VolumeSeries = oChartModel.getProperty("/sma30VolumeSeries");
			var iPricePaneIndex;
			
			if (oChartModel.getProperty("/displayBollingerBandWidth") === true || 
				oChartModel.getProperty("/displaySlowStochastic") === true ||
				oChartModel.getProperty("/displayRsLine") === true ||
				oChartModel.getProperty("/displayHealthCheckEvents") === true) {	
					
				iPricePaneIndex = 1;	
			} else {
				iPricePaneIndex = 0;
			}
			
			if (oChartModel.getProperty("/displayEma21") === true) {				
				if (oEma21Series !== undefined && oChart !== undefined) {
					oEma21Series.moveToPane(iPricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma50") === true) {	
				if (oSma50Series !== undefined && oChart !== undefined) {
					oSma50Series.moveToPane(iPricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma150") === true) {	
				if (oSma150Series !== undefined && oChart !== undefined) {
					oSma150Series.moveToPane(iPricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma200") === true) {	
				if (oSma200Series !== undefined && oChart !== undefined) {
					oSma200Series.moveToPane(iPricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma30Volume") === true) {	
				if (oSma30VolumeSeries !== undefined && oChart !== undefined) {
					oSma30VolumeSeries.moveToPane(iPricePaneIndex);
				}
			}
		},
		
		
		/**
		 * Gets the threshold value of the Bollinger BandWidth.
		 */
		getBBWThreshold: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var oQuotation = aQuotations[0];
			
			//The threshold is stored in the newest quotation.
			return oQuotation.indicator.bbw10Threshold25Percent;
		},
		
		
		/**
		 * Checks if the instrument for which quotations have been loaded is of type RATIO.
		 */
		isInstrumentTypeRatio: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var oQuotation;
			
			if (aQuotations.length === 0) {
				return false;
			}
			
			oQuotation = aQuotations[0];
				
			if (oQuotation.instrument.type === Constants.INSTRUMENT_TYPE.RATIO) {
				return true;
			} else {
				return false;
			}
		},
		
		
		/**
		 * Draws horizontal lines to the TradingView chart.
		 */
		drawHorizontalLines: function(oCallingController, oHorizontalLines) {
			var aHorizontalLines = oHorizontalLines.getProperty("/horizontalLine");
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
						
			for (var i = 0; i < aHorizontalLines.length; i++) {
				var oHorizontalLine = aHorizontalLines[i];
				
				const oPriceLine = { price: oHorizontalLine.price, color: 'black', lineWidth: 1, lineStyle: 0 };
				oCandlestickSeries.createPriceLine(oPriceLine);
			}
		},
		
		
		/**
		 * Sets the number of candles that are being displayed.
		 */
		setVisibleNumberOfCandles: function(oCallingController, iNumberOfCandles) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oChart = oChartModel.getProperty("/chart");
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var iNumberExistingCandles = aQuotations.length;
			var iStartIndex = iNumberExistingCandles - iNumberOfCandles;
			
			oChart.timeScale().setVisibleLogicalRange({ from: iStartIndex, to: iNumberExistingCandles });
		}
	};
});