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
		}
	};
});