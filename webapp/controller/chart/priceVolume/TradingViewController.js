sap.ui.define([
	"../../Constants",
	"sap/ui/core/format/DateFormat"
], function (Constants, DateFormat) {
	"use strict";
	return {
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
		 * Applies the moving averages to the chart according to the state of the ToggleButtons.
		 */
		applyMovingAverages : function(oCallingController) {
			var oEma21Button = oCallingController.getView().byId("ema21Button");
			var oSma50Button = oCallingController.getView().byId("sma50Button");
			var oSma150Button = oCallingController.getView().byId("sma150Button");
			var oSma200Button = oCallingController.getView().byId("sma200Button");
			var oSma30VolumeButton = oCallingController.getView().byId("sma30VolumeButton");
			
			this.displayEma21(oCallingController, oEma21Button.getPressed());
			this.displaySma50(oCallingController, oSma50Button.getPressed());
			this.displaySma150(oCallingController, oSma150Button.getPressed());
			this.displaySma200(oCallingController, oSma200Button.getPressed());
			this.displaySma30Volume(oCallingController, oSma30VolumeButton.getPressed());
		},
		
		
		/**
		 * Displays the EMA(21) in the chart.
		 */
		displayEma21 : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var ema21Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.EMA_21);
	
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
		displaySma50 : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma50Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_50);
	
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
		displaySma150 : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma150Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_150);
	
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
		displaySma200 : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma200Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_200);
	
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
		displaySma30Volume : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var sma30VolumeData = this.getMovingAverageData(oCallingController, "SMA_30_VOLUME");
	
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
		 * Create a line series that contains the data of the requested moving average.
		 */
		getMovingAverageData : function (oCallingController, sRequestedMA) {
			var oQuotationsModel = oCallingController.getView().getModel("quotationsForChart");
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
		}
	};
});