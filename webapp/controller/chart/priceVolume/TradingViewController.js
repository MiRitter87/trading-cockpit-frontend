sap.ui.define([
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"./lightweight-charts.standalone.production"
], function(Constants, JSONModel, DateFormat) {
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
	
			const chart = LightweightCharts.createChart(document.getElementById(sChartContainerDivId), {
  				width: document.getElementById(sChartContainerDivId).clientWidth,
                height: document.getElementById(sChartContainerDivId).clientHeight,
                autoSize: true
            });
            
            const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, { priceLineVisible: false });
			candlestickSeries.setData(this.getCandlestickSeries(oCallingController));
			
			if (bIsInstrumentTypeRatio === false) {
				const volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
					priceFormat: {
	        			type: 'volume',
	    			},
	    			priceScaleId: 'left',
	    			priceLineVisible: false
				});	
				volumeSeries.setData(this.getVolumeSeries(oCallingController));	
				
				oChartModel.setProperty("/volumeSeries", volumeSeries);			
			}
			
			this.applyChartOptions(chart, bIsInstrumentTypeRatio);
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			chart.timeScale().fitContent();
			
			//Handle clicks in the chart. The controller needs to be bound to access the data model within the handler.
			chart.subscribeClick(oCallingController.onChartClicked.bind(oCallingController));
			
			//Store chart Model for further access.
			oChartModel.setProperty("/chart", chart);
			oChartModel.setProperty("/candlestickSeries", candlestickSeries);
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
			var chart = oChartModel.getProperty("/chart");
			var ema21Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.EMA_21);
			var isEma21Visible = oChartModel.getProperty("/displayEma21");
	
			if (isEma21Visible === true) {
				const ema21Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'yellow', lineWidth: 1, priceLineVisible: false });
				ema21Series.setData(ema21Data);
				oChartModel.setProperty("/ema21Series", ema21Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const ema21Series = oChartModel.getProperty("/ema21Series");
				
				if (ema21Series !== undefined && chart !== undefined) {
					chart.removeSeries(ema21Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(50) in the chart.
		 */
		displaySma50: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var sma50Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_50);
			var isSma50Visible = oChartModel.getProperty("/displaySma50");
	
			if (isSma50Visible === true) {
				const sma50Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'blue', lineWidth: 1, priceLineVisible: false });
				sma50Series.setData(sma50Data);
				oChartModel.setProperty("/sma50Series", sma50Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const sma50Series = oChartModel.getProperty("/sma50Series");
				
				if (sma50Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma50Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(150) in the chart.
		 */
		displaySma150: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var sma150Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_150);
			var isSma150Visible = oChartModel.getProperty("/displaySma150");
	
			if (isSma150Visible === true) {
				const sma150Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'red', lineWidth: 1, priceLineVisible: false });
				sma150Series.setData(sma150Data);
				oChartModel.setProperty("/sma150Series", sma150Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const sma150Series = oChartModel.getProperty("/sma150Series");
				
				if (sma150Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma150Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(200) in the chart.
		 */
		displaySma200: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var sma200Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_200);
			var isSma200Visible = oChartModel.getProperty("/displaySma200");
	
			if (isSma200Visible === true) {
				const sma200Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'green', lineWidth: 1, priceLineVisible: false });
				sma200Series.setData(sma200Data);
				oChartModel.setProperty("/sma200Series", sma200Series);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const sma200Series = oChartModel.getProperty("/sma200Series");
				
				if (sma200Series !== undefined && chart !== undefined) {
					chart.removeSeries(sma200Series);
				}
			}
		},
		
		
		/**
		 * Displays the SMA(30) of the volume in the chart.
		 */
		displaySma30Volume: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var sma30VolumeData = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_30_VOLUME);
			var isSma30VolumeVisible = oChartModel.getProperty("/displaySma30Volume");
	
			if (isSma30VolumeVisible === true) {
				const sma30VolumeSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, priceScaleId: 'left' }
				);
				sma30VolumeSeries.setData(sma30VolumeData);
				oChartModel.setProperty("/sma30VolumeSeries", sma30VolumeSeries);
				
				this.organizeMovingAverages(oChartModel);
			} else {
				const sma30VolumeSeries = oChartModel.getProperty("/sma30VolumeSeries");
				
				if (sma30VolumeSeries !== undefined && chart !== undefined) {
					chart.removeSeries(sma30VolumeSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Bollinger BandWidth in a separate pane of the chart.
		 */
		displayBollingerBandWidth: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var bbwData;
			var bbwThreshold = this.getBBWThreshold(oCallingController);
			var isBbwVisible = oChartModel.getProperty("/displayBollingerBandWidth");
			
			if (isBbwVisible === true) {
				bbwData = this.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.BBW);
				
				const bbwSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				bbwSeries.setData(bbwData);
				
				//Draw horizontal trigger line
				const priceLine = { price: bbwThreshold, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				bbwSeries.createPriceLine(priceLine);
				
				oChartModel.setProperty("/bbwSeries", bbwSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const bbwSeries = oChartModel.getProperty("/bbwSeries");
				
				if (bbwSeries !== undefined && chart !== undefined) {
					chart.removeSeries(bbwSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Slow Stochastic in a separate pane of the chart.
		 */
		displaySlowStochastic: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var slowStochasticData;
			var isSlowStochasticVisible = oChartModel.getProperty("/displaySlowStochastic");
			
			if (isSlowStochasticVisible === true) {
				slowStochasticData = this.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.SLOW_STOCHASTIC);
				
				const slowStochasticSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				slowStochasticSeries.setData(slowStochasticData);
				
				//Draw horizontal trigger lines
				const priceLineTop = { price: 85, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				slowStochasticSeries.createPriceLine(priceLineTop);
				const priceLineMid = { price: 50, color: 'black', lineWidth: 1, lineStyle: 2, axisLabelVisible: false };
				slowStochasticSeries.createPriceLine(priceLineMid);
				const priceLineBot = { price: 15, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				slowStochasticSeries.createPriceLine(priceLineBot);
				
				oChartModel.setProperty("/slowStochasticSeries", slowStochasticSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const slowStochasticSeries = oChartModel.getProperty("/slowStochasticSeries");
				
				if (slowStochasticSeries !== undefined && chart !== undefined) {
					chart.removeSeries(slowStochasticSeries);
				}
			}
		},
		
		
		/**
		 * Displays the RS line in a separate pane of the chart.
		 */
		displayRsLine: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var rsLineData;
			var isRsLineVisible = oChartModel.getProperty("/displayRsLine");
			
			if (isRsLineVisible === true) {
				rsLineData = this.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.RS_LINE);
				
				const rsLineSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				rsLineSeries.setData(rsLineData);
				
				
				oChartModel.setProperty("/rsLineSeries", rsLineSeries);
				
				this.organizePanesPriceVolume(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const rsLineSeries = oChartModel.getProperty("/rsLineSeries");
				
				if (rsLineSeries !== undefined && chart !== undefined) {
					chart.removeSeries(rsLineSeries);
				}
			}
		},
		
		
		/**
		 * Displays a Histogram with the net sum of health check events for each trading day.
		 */
		displayHealthCheckEvents: function(oCallingController) {
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var chart = oChartModel.getProperty("/chart");
			var healthEventData;
			var areEventsVisible = oChartModel.getProperty("/displayHealthCheckEvents");
			
			if (areEventsVisible === true) {
				healthEventData = this.getHealthEventData(oCallingController);
				
				const healthEventSeries = chart.addSeries(LightweightCharts.HistogramSeries,
					{ color: 'blue', priceLineVisible: false}
				);
				healthEventSeries.setData(healthEventData);
				
				oChartModel.setProperty("/healthEventSeries", healthEventSeries);
				
				this.organizePanesHealthCheck(oChartModel);
				this.organizeMovingAverages(oChartModel);
			} else {
				const healthEventSeries = oChartModel.getProperty("/healthEventSeries");
				
				if (healthEventSeries !== undefined && chart !== undefined) {
					chart.removeSeries(healthEventSeries);
				}
			}
		},
		
		
		/**
		 * Organizes the panes of the price/volume chart in a manner that 
		 * the indicator is at the top pane and the price/volume pane is below.
		 */
		organizePanesPriceVolume: function(oChartModel) {
			var chart = oChartModel.getProperty("/chart");
			var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
			var volumeSeries = oChartModel.getProperty("/volumeSeries");
			var bbwSeries = oChartModel.getProperty("/bbwSeries");
			var slowStochasticSeries = oChartModel.getProperty("/slowStochasticSeries");
			var rsLineSeries = oChartModel.getProperty("/rsLineSeries");
			var indicatorPane;
			var chartHeight;
			
			if (oChartModel.getProperty("/displayBollingerBandWidth") === true) {	
				bbwSeries.moveToPane(0);
				candlestickSeries.moveToPane(1);
				volumeSeries.moveToPane(1);
				
				bbwSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			}
			
			if (oChartModel.getProperty("/displaySlowStochastic") === true) {	
				slowStochasticSeries.moveToPane(0);
				candlestickSeries.moveToPane(1);
				volumeSeries.moveToPane(1);
				
				slowStochasticSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			}
			
			if (oChartModel.getProperty("/displayRsLine") === true) {	
				rsLineSeries.moveToPane(0);
				candlestickSeries.moveToPane(1);
				volumeSeries.moveToPane(1);
				
				rsLineSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
			}
			
			chartHeight = chart.options().height;
			indicatorPane = chart.panes()[0];
			indicatorPane.setHeight(chartHeight * 0.15);
			
			candlestickSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
		},
		
		
		/**
		 * Organizes the panes of the health check chart in a manner that
		 * the indicator is at the top pane and the price/volume pane is below.
		 */
		organizePanesHealthCheck: function(oChartModel) {
			var chart = oChartModel.getProperty("/chart");
			var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
			var volumeSeries = oChartModel.getProperty("/volumeSeries");
			var healthEventSeries = oChartModel.getProperty("/healthEventSeries");
			var indicatorPane;
			var chartHeight;
			
			healthEventSeries.moveToPane(0);
			candlestickSeries.moveToPane(1);
			volumeSeries.moveToPane(1);
			healthEventSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
			candlestickSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
			
			chartHeight = chart.options().height;
			indicatorPane = chart.panes()[0];
			indicatorPane.setHeight(chartHeight * 0.15);
		},
		
		
		/**
		 * Moves the moving averages to the target pane depending on the visibility of any indicator.
		 */
		organizeMovingAverages: function(oChartModel) {
			var chart = oChartModel.getProperty("/chart");
			var ema21Series = oChartModel.getProperty("/ema21Series");
			var sma50Series = oChartModel.getProperty("/sma50Series");
			var sma150Series = oChartModel.getProperty("/sma150Series");
			var sma200Series = oChartModel.getProperty("/sma200Series");
			var sma30VolumeSeries = oChartModel.getProperty("/sma30VolumeSeries");
			var pricePaneIndex;
			
			if (oChartModel.getProperty("/displayBollingerBandWidth") === true || 
				oChartModel.getProperty("/displaySlowStochastic") === true ||
				oChartModel.getProperty("/displayRsLine") === true ||
				oChartModel.getProperty("/displayHealthCheckEvents") === true) {	
					
				pricePaneIndex = 1;	
			} else {
				pricePaneIndex = 0;
			}
			
			if (oChartModel.getProperty("/displayEma21") === true) {				
				if (ema21Series !== undefined && chart !== undefined) {
					ema21Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma50") === true) {	
				if (sma50Series !== undefined && chart !== undefined) {
					sma50Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma150") === true) {	
				if (sma150Series !== undefined && chart !== undefined) {
					sma150Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma200") === true) {	
				if (sma200Series !== undefined && chart !== undefined) {
					sma200Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oChartModel.getProperty("/displaySma30Volume") === true) {	
				if (sma30VolumeSeries !== undefined && chart !== undefined) {
					sma30VolumeSeries.moveToPane(pricePaneIndex);
				}
			}
		},
		
		
		/**
		 * Create a line series that contains the data of the requested moving average.
		 */
		getMovingAverageData: function(oCallingController, sRequestedMA) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var aMovingAverageSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
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
		 * Create a series that contains the data of the requested indicator.
		 */
		getIndicatorData: function(oCallingController, sRequestedIndicator) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var aIndicatorSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
    			var oIndicatorDataset = new Object();
    			
    			if (oQuotation.indicator === null) {
					continue;
				}
				
				if (sRequestedIndicator === Constants.CHART_INDICATOR.BBW && oQuotation.indicator.bollingerBandWidth10Days !== 0) {
					oIndicatorDataset.value = oQuotation.indicator.bollingerBandWidth10Days;
				}
				
				if (sRequestedIndicator === Constants.CHART_INDICATOR.SLOW_STOCHASTIC && oQuotation.indicator.slowStochastic14Days !== 0) {
					oIndicatorDataset.value = oQuotation.indicator.slowStochastic14Days;
				}
				
				if (sRequestedIndicator === Constants.CHART_INDICATOR.RS_LINE) {
					if (oQuotation.relativeStrengthData === null) {
						// For example on holidays when the divisor instrument is not traded. No RS-Data available then.
						continue;
					}
					
					if (oQuotation.relativeStrengthData.rsLinePrice !== 0) {					
						oIndicatorDataset.value = oQuotation.relativeStrengthData.rsLinePrice;
					}
				}
    			    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oIndicatorDataset.time = sFormattedDate;
    			
    			aIndicatorSeries.push(oIndicatorDataset);
    		}
    		
    		return aIndicatorSeries;
		},
		
		
		/**
		 * Create a series that contains health check event data.
		 */
		getHealthEventData: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var oHealthEvents = oChartData.getProperty("/healthEvents");
			var aHealthEventSeries = new Array()
			var oDateFormat, oDate, sFormattedDate;
			var healthEventMap;
			
			if (oHealthEvents === undefined) {
				return;
			}
			
			healthEventMap = new Map(Object.entries(oHealthEvents));
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
    			var oHealthEventDataset = new Object();
    			var eventNumber = healthEventMap.get(String(oQuotation.date));
    			
    			if (eventNumber === undefined) {
					continue;
				}
				
				oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oHealthEventDataset.time = sFormattedDate;
    			oHealthEventDataset.value = eventNumber;
    			
    			aHealthEventSeries.push(oHealthEventDataset);
    		}
    		
    		return aHealthEventSeries;
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
			var aHorizontalLines = oHorizontalLines.oData.horizontalLine;
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
						
			for (var i = 0; i < aHorizontalLines.length; i++) {
				var oHorizontalLine = aHorizontalLines[i];
				
				const priceLine = { price: oHorizontalLine.price, color: 'black', lineWidth: 1, lineStyle: 0 };
				oCandlestickSeries.createPriceLine(priceLine);
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