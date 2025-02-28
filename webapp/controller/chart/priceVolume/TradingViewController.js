sap.ui.define([
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"./lightweight-charts.standalone.production"
], function (Constants, JSONModel, DateFormat) {
	"use strict";
	return {
		/**
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart : function (oCallingController) {
			var sDivId = "chartContainer";
			var oChartModel = new JSONModel();
			var bIsInstrumentTypeRatio = this.isInstrumentTypeRatio(oCallingController);
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(sDivId).innerHTML = "";
	
			const chart = LightweightCharts.createChart(document.getElementById("chartContainer"), {
  				width: document.getElementById("chartContainer").clientWidth,
                height: document.getElementById("chartContainer").clientHeight,
                autoSize: true
            });
            
            const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, { priceLineVisible: false });
			candlestickSeries.setData(this.getCandlestickSeries(oCallingController));
			
			if (bIsInstrumentTypeRatio === false) {
				const volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
					priceFormat: {
	        			type: 'volume',
	    			},
	    			priceScaleId: 'left'
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
		getCandlestickSeries : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aCandlestickSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
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
		getVolumeSeries : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aVolumeSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
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
		applyMovingAverages : function (oCallingController) {
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
		 * Applies the indicators to the chart according to the state of the ToggleButtons.
		 */
		applyIndicators : function (oCallingController) {
			var bbwButton = oCallingController.getView().byId("bbwButton");
			var slowStochasticButton = oCallingController.getView().byId("slowStochasticButton");
			
			this.displayBollingerBandWidth(oCallingController, bbwButton.getPressed());
			this.displaySlowStochastic(oCallingController, slowStochasticButton.getPressed());
		},
		
		
		/**
		 * Displays the EMA(21) in the chart.
		 */
		displayEma21 : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var ema21Data = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.EMA_21);
	
			if (bVisible === true) {
				const ema21Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'yellow', lineWidth: 1, priceLineVisible: false });
				ema21Series.setData(ema21Data);
				chartModel.setProperty("/ema21Series", ema21Series);
				
				this.organizeMovingAverages(oCallingController, chartModel);
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
				const sma50Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'blue', lineWidth: 1, priceLineVisible: false });
				sma50Series.setData(sma50Data);
				chartModel.setProperty("/sma50Series", sma50Series);
				
				this.organizeMovingAverages(oCallingController, chartModel);
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
				const sma150Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'red', lineWidth: 1, priceLineVisible: false });
				sma150Series.setData(sma150Data);
				chartModel.setProperty("/sma150Series", sma150Series);
				
				this.organizeMovingAverages(oCallingController, chartModel);
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
				const sma200Series = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'green', lineWidth: 1, priceLineVisible: false });
				sma200Series.setData(sma200Data);
				chartModel.setProperty("/sma200Series", sma200Series);
				
				this.organizeMovingAverages(oCallingController, chartModel);
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
			var sma30VolumeData = this.getMovingAverageData(oCallingController, Constants.CHART_OVERLAY.SMA_30_VOLUME);
	
			if (bVisible === true) {
				const sma30VolumeSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, priceScaleId: 'left' }
				);
				sma30VolumeSeries.setData(sma30VolumeData);
				chartModel.setProperty("/sma30VolumeSeries", sma30VolumeSeries);
				
				this.organizeMovingAverages(oCallingController, chartModel);
			} else {
				const sma30VolumeSeries = chartModel.getProperty("/sma30VolumeSeries");
				
				if (sma30VolumeSeries !== undefined && chart !== undefined) {
					chart.removeSeries(sma30VolumeSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Bollinger BandWidth in a separate pane of the chart.
		 */
		displayBollingerBandWidth : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var bbwData = this.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.BBW);
			var bbwThreshold = this.getBBWThreshold(oCallingController);
			
			if (bVisible === true) {
				const bbwSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				bbwSeries.setData(bbwData);
				
				//Draw horizontal trigger line
				const priceLine = { price: bbwThreshold, color: 'black', lineWidth: 1, lineStyle: 0, axisLabelVisible: false };
				bbwSeries.createPriceLine(priceLine);
				
				chartModel.setProperty("/bbwSeries", bbwSeries);
				
				this.organizePanes(oCallingController, chartModel);
				this.organizeMovingAverages(oCallingController, chartModel);
			} else {
				const bbwSeries = chartModel.getProperty("/bbwSeries");
				
				if (bbwSeries !== undefined && chart !== undefined) {
					chart.removeSeries(bbwSeries);
				}
			}
		},
		
		
		/**
		 * Displays the Slow Stochastic in a separate pane of the chart.
		 */
		displaySlowStochastic : function (oCallingController, bVisible) {
			var chartModel = oCallingController.getView().getModel("chartModel");
			var chart = chartModel.getProperty("/chart");
			var slowStochasticData = this.getIndicatorData(oCallingController, Constants.CHART_INDICATOR.SLOW_STOCHASTIC);
			
			if (bVisible === true) {
				const slowStochasticSeries = chart.addSeries(LightweightCharts.LineSeries, 
					{ color: 'black', lineWidth: 1, priceLineVisible: false, lastValueVisible: true }
				);
				slowStochasticSeries.setData(slowStochasticData);
				
				chartModel.setProperty("/slowStochasticSeries", slowStochasticSeries);
				
				this.organizePanes(oCallingController, chartModel);
				this.organizeMovingAverages(oCallingController, chartModel);
			} else {
				const slowStochasticSeries = chartModel.getProperty("/slowStochasticSeries");
				
				if (slowStochasticSeries !== undefined && chart !== undefined) {
					chart.removeSeries(slowStochasticSeries);
				}
			}
		},
		
		
		/**
		 * Organizes the panes in a manner that the indicator is at the top pane and the price/volume pane is below.
		 */
		organizePanes : function (oCallingController, oChartModel) {
			var chart = oChartModel.getProperty("/chart");
			var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
			var volumeSeries = oChartModel.getProperty("/volumeSeries");
			var bbwSeries = oChartModel.getProperty("/bbwSeries");
			var slowStochasticSeries = oChartModel.getProperty("/slowStochasticSeries");
			var indicatorPane;
			var chartHeight;
			
			if (oCallingController.getView().byId("bbwButton").getPressed() === true) {	
				bbwSeries.moveToPane(0);
				candlestickSeries.moveToPane(1);
				volumeSeries.moveToPane(1);
				
				bbwSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
				
				chartHeight = chart.options().height;
				indicatorPane = chart.panes()[0];
				indicatorPane.setHeight(chartHeight * 0.15);
			}
			
			if (oCallingController.getView().byId("slowStochasticButton").getPressed() === true) {	
				slowStochasticSeries.moveToPane(0);
				candlestickSeries.moveToPane(1);
				volumeSeries.moveToPane(1);
				
				slowStochasticSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Normal });
				
				chartHeight = chart.options().height;
				indicatorPane = chart.panes()[0];
				indicatorPane.setHeight(chartHeight * 0.15);
			}
			
			candlestickSeries.priceScale().applyOptions({ mode: LightweightCharts.PriceScaleMode.Logarithmic });
		},
		
		
		/**
		 * Moves the moving averages to the target pane depending on the state of the indicator button.
		 */
		organizeMovingAverages : function (oCallingController, oChartModel) {
			var chart = oChartModel.getProperty("/chart");
			var ema21Series = oChartModel.getProperty("/ema21Series");
			var sma50Series = oChartModel.getProperty("/sma50Series");
			var sma150Series = oChartModel.getProperty("/sma150Series");
			var sma200Series = oChartModel.getProperty("/sma200Series");
			var sma30VolumeSeries = oChartModel.getProperty("/sma30VolumeSeries");
			var pricePaneIndex;
			
			if (oCallingController.getView().byId("bbwButton").getPressed() === true || 
				oCallingController.getView().byId("slowStochasticButton").getPressed() === true) {	
					
				pricePaneIndex = 1;	
			} else {
				pricePaneIndex = 0;
			}
			
			if (oCallingController.getView().byId("ema21Button").getPressed() === true) {				
				if (ema21Series !== undefined && chart !== undefined) {
					ema21Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oCallingController.getView().byId("sma50Button").getPressed() === true) {	
				if (sma50Series !== undefined && chart !== undefined) {
					sma50Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oCallingController.getView().byId("sma150Button").getPressed() === true) {	
				if (sma150Series !== undefined && chart !== undefined) {
					sma150Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oCallingController.getView().byId("sma200Button").getPressed() === true) {	
				if (sma200Series !== undefined && chart !== undefined) {
					sma200Series.moveToPane(pricePaneIndex);
				}
			}
			
			if (oCallingController.getView().byId("sma30VolumeButton").getPressed() === true) {	
				if (sma30VolumeSeries !== undefined && chart !== undefined) {
					sma30VolumeSeries.moveToPane(pricePaneIndex);
				}
			}
		},
		
		
		/**
		 * Create a line series that contains the data of the requested moving average.
		 */
		getMovingAverageData : function (oCallingController, sRequestedMA) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aMovingAverageSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
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
		 * Create a line series that contains the data of the requested indicator.
		 */
		getIndicatorData : function (oCallingController, sRequestedIndicator) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aIndicatorSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "yyyy-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for (var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
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
    			    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oIndicatorDataset.time = sFormattedDate;
    			
    			aIndicatorSeries.push(oIndicatorDataset);
    		}
    		
    		return aIndicatorSeries;
		},
		
		
		/**
		 * Gets the threshold value of the Bollinger BandWidth.
		 */
		getBBWThreshold : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var oQuotation = oQuotations[0];
			
			//The threshold is stored in the newest quotation.
			return oQuotation.indicator.bbw10Threshold25Percent;
		},
		
		
		/**
		 * Checks if the instrument for which quotations have been loaded is of type RATIO.
		 */
		isInstrumentTypeRatio : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("chartData");
			var oQuotations = oQuotationsModel.oData.quotation;
			var oQuotation;
			
			if (oQuotations.length === 0) {
				return false;
			}
			
			oQuotation = oQuotations[0];
				
			if (oQuotation.instrument.type === Constants.INSTRUMENT_TYPE.RATIO) {
				return true;
			} else {
				return false;
			}
		},
		
		
		/**
		 * Draws horizontal lines to the TradingView chart.
		 */
		drawHorizontalLines : function(oCallingController, oHorizontalLines) {
			var aHorizontalLines = oHorizontalLines.oData.horizontalLine;
			var oChartModel = oCallingController.getView().getModel("chartModel");
			var oCandlestickSeries = oChartModel.getProperty("/candlestickSeries");
						
			for (var i = 0; i < aHorizontalLines.length; i++) {
				var oHorizontalLine = aHorizontalLines[i];
				
				const priceLine = { price: oHorizontalLine.price, color: 'black', lineWidth: 1, lineStyle: 0 };
				oCandlestickSeries.createPriceLine(priceLine);
			}
		},
	};
});