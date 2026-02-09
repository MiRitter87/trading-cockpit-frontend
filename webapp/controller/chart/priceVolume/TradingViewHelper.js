sap.ui.define([
	"../../Constants",
	"sap/ui/core/format/DateFormat"
], function(Constants, DateFormat) {
	"use strict";
	return {
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
				if (sRequestedMA === Constants.CHART_OVERLAY.EMA_10 && oQuotation.movingAverageData.ema10 !== 0) {
					oMovingAverageDataset.value = oQuotation.movingAverageData.ema10;
				} else if (sRequestedMA === Constants.CHART_OVERLAY.EMA_21 && oQuotation.movingAverageData.ema21 !== 0) {
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
			var mHealthEventMap;
			
			if (oHealthEvents === undefined) {
				return;
			}
			
			mHealthEventMap = new Map(Object.entries(oHealthEvents));
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
    			var oQuotation = aQuotations[i];
    			var oHealthEventDataset = new Object();
    			var iEventNumber = mHealthEventMap.get(String(oQuotation.date));
    			
    			if (iEventNumber === undefined) {
					continue;
				}
				
				oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oHealthEventDataset.time = sFormattedDate;
    			oHealthEventDataset.value = iEventNumber;
    			
    			aHealthEventSeries.push(oHealthEventDataset);
    		}
    		
    		return aHealthEventSeries;
		},
		
		
		/**
		 * Create a series that contains the data of the EMA(21) of the RS-Line.
		 */
		getRsLineEma21Data: function(oCallingController) {
			var oChartData = oCallingController.getView().getModel("chartData");
			var aQuotations = oChartData.getProperty("/quotations/quotation");
			var aRsLineEmaSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;

			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});

			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = aQuotations.length -1; i >= 0; i--) {
				var oQuotation = aQuotations[i];
				var oRsLineEmaDataset = new Object();
				
				if (oQuotation.relativeStrengthData === null) {
					continue;
				}
				
				if (oQuotation.relativeStrengthData.rsLineEma21 === 0) {
					continue;
				}
				    			
				oDate = new Date(parseInt(oQuotation.date));
				sFormattedDate = oDateFormat.format(oDate);
				oRsLineEmaDataset.time = sFormattedDate;
				oRsLineEmaDataset.value = oQuotation.relativeStrengthData.rsLineEma21;
				
				aRsLineEmaSeries.push(oRsLineEmaDataset);
			}

			return aRsLineEmaSeries;
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
			var oRsLineEmaSeries = oChartModel.getProperty("/rsLineEmaSeries");
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
				oRsLineEmaSeries.moveToPane(0);
				oCandlestickSeries.moveToPane(1);
				oVolumeSeries.moveToPane(1);
				
				oRsLineSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
				oRsLineEmaSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
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
			var oEma10Series = oChartModel.getProperty("/ema10Series");
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
			
			if (oChartModel.getProperty("/displayEma10") === true) {				
				if (oEma10Series !== undefined && oChart !== undefined) {
					oEma10Series.moveToPane(iPricePaneIndex);
				}
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
		}
	};
});