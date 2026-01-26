sap.ui.define([
	"../MainController",
	"../Constants",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/ObjectStatus",
	"sap/m/MessageBox",
	"sap/m/p13n/MetadataHelper"
], function(MainController, Constants, Text, Link, ObjectStatus, MessageBox, MetadataHelper) {
	"use strict";
	return {
		/**
		 * Opens a MessageBox with information about the selected scan template.
		 */
		openTemplateInformation: function(oResourceBundle, sKey) {
			var oOptions = new Object();
			var sTitle = "";
			var sDescription = "";
			
			if (sKey === Constants.SCAN_TEMPLATE.ALL) {
				sTitle = oResourceBundle.getText("scanResults.template.all");
				sDescription = oResourceBundle.getText("scanResults.template.all.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.BUYABLE_BASE) {
				sTitle = oResourceBundle.getText("scanResults.template.buyableBase");
				sDescription = oResourceBundle.getText("scanResults.template.buyableBase.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.MINERVINI_TREND_TEMPLATE) {
				sTitle = oResourceBundle.getText("scanResults.template.minervini");
				sDescription = oResourceBundle.getText("scanResults.template.minervini.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.CONSOLIDATION_10_WEEKS) {
				sTitle = oResourceBundle.getText("scanResults.template.consolidation10Weeks");
				sDescription = oResourceBundle.getText("scanResults.template.consolidation10Weeks.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.CONSOLIDATION_10_DAYS) {
				sTitle = oResourceBundle.getText("scanResults.template.consolidation10Days");
				sDescription = oResourceBundle.getText("scanResults.template.consolidation10Days.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.BREAKOUT_CANDIDATES) {
				sTitle = oResourceBundle.getText("scanResults.template.breakoutCandidates");
				sDescription = oResourceBundle.getText("scanResults.template.breakoutCandidates.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.UP_ON_VOLUME) {
				sTitle = oResourceBundle.getText("scanResults.template.upOnVolume");
				sDescription = oResourceBundle.getText("scanResults.template.upOnVolume.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.DOWN_ON_VOLUME) {
				sTitle = oResourceBundle.getText("scanResults.template.downOnVolume");
				sDescription = oResourceBundle.getText("scanResults.template.downOnVolume.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.NEAR_52_WEEK_HIGH) {
				sTitle = oResourceBundle.getText("scanResults.template.near52WeekHigh");
				sDescription = oResourceBundle.getText("scanResults.template.near52WeekHigh.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.NEAR_52_WEEK_LOW) {
				sTitle = oResourceBundle.getText("scanResults.template.near52WeekLow");
				sDescription = oResourceBundle.getText("scanResults.template.near52WeekLow.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.RS_SINCE_DATE) {
				sTitle = oResourceBundle.getText("scanResults.template.rsSinceDate");
				sDescription = oResourceBundle.getText("scanResults.template.rsSinceDate.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.THREE_WEEKS_TIGHT) {
				sTitle = oResourceBundle.getText("scanResults.template.threeWeeksTight");
				sDescription = oResourceBundle.getText("scanResults.template.threeWeeksTight.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.HIGH_TIGHT_FLAG) {
				sTitle = oResourceBundle.getText("scanResults.template.highTightFlag");
				sDescription = oResourceBundle.getText("scanResults.template.highTightFlag.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.SWING_TRADING_ENVIRONMENT) {
				sTitle = oResourceBundle.getText("scanResults.template.swingTradingEnvironment");
				sDescription = oResourceBundle.getText("scanResults.template.swingTradingEnvironment.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.RS_NEAR_HIGH_IG) {
				sTitle = oResourceBundle.getText("scanResults.template.rsNearHighIg");
				sDescription = oResourceBundle.getText("scanResults.template.rsNearHighIg.description");
			}
			else if (sKey === Constants.SCAN_TEMPLATE.MA_PRICE_CONVERGENCE) {
				sTitle = oResourceBundle.getText("scanResults.template.maPriceConvergence");
				sDescription = oResourceBundle.getText("scanResults.template.maPriceConvergence.description");
			}
			else {
				MessageBox.information(oResourceBundle.getText("scanResults.noTemplateSelected"));
				return;
			}		
			
			oOptions.title = sTitle
			MessageBox.information(sDescription, oOptions);
		},
		
		
		/**
		 * Initializes the ComboBox for Scan template selection.
		 */
		initializeTemplateComboBox: function(oResourceBundle, oComboBox) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.ALL, "scanResults.template.all");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.BUYABLE_BASE, "scanResults.template.buyableBase");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.BREAKOUT_CANDIDATES, "scanResults.template.breakoutCandidates");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.MA_PRICE_CONVERGENCE, "scanResults.template.maPriceConvergence");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.CONSOLIDATION_10_WEEKS, "scanResults.template.consolidation10Weeks");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.CONSOLIDATION_10_DAYS, "scanResults.template.consolidation10Days");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.HIGH_TIGHT_FLAG, "scanResults.template.highTightFlag");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.THREE_WEEKS_TIGHT, "scanResults.template.threeWeeksTight");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.MINERVINI_TREND_TEMPLATE, "scanResults.template.minervini");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.SWING_TRADING_ENVIRONMENT, "scanResults.template.swingTradingEnvironment");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.RS_NEAR_HIGH_IG, "scanResults.template.rsNearHighIg");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.RS_SINCE_DATE, "scanResults.template.rsSinceDate");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.UP_ON_VOLUME, "scanResults.template.upOnVolume");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.DOWN_ON_VOLUME, "scanResults.template.downOnVolume");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.NEAR_52_WEEK_HIGH, "scanResults.template.near52WeekHigh");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.NEAR_52_WEEK_LOW, "scanResults.template.near52WeekLow");
		},
		
		
		/**
		 * Gets the MetadataHelper that contains column information of the scan results table.
		 */
		getMetadataHelper: function(oResourceBundle) {
			var oMetadataHelper = new MetadataHelper([
				{key: "symbolColumn", label: oResourceBundle.getText("instrument.symbol"), 
					path: "instrument/symbol"},
				{key: "nameColumn", label: oResourceBundle.getText("instrument.name"), 
					path: "instrument/name"},
				{key: "igNameColumn", label: oResourceBundle.getText("instrument.industryGroup"), 
					path: "instrument/industryGroup/name"},
				{key: "typeColumn", label: oResourceBundle.getText("instrument.type"), 
					path: "instrument/type"},
				{key: "rsNumberColumn", label: oResourceBundle.getText("indicator.rsNumber"), 
					path: "relativeStrengthData/rsNumber"},
				{key: "rsNumberCompositeIgColumn", label: oResourceBundle.getText("indicator.rsNumberCompositeIg"), 
					path: "relativeStrengthData/rsNumberCompositeIg"},
				{key: "sectorRsNumberColumn", label: oResourceBundle.getText("indicator.sectorRsNumber"), 
					path: "relativeStrengthData/rsNumberSector"},
				{key: "industryGroupRsNumberColumn", label: oResourceBundle.getText("indicator.industryGroupRsNumber"), 
					path: "relativeStrengthData/rsNumberIndustryGroup"},
				{key: "distanceTo52WeekHighColumn", label: oResourceBundle.getText("indicator.distanceTo52WeekHigh"), 
					path: "indicator/distanceTo52WeekHigh"},
				{key: "performance5DaysColumn", label: oResourceBundle.getText("indicator.performance5Days"), 
					path: "indicator/performance5Days"},
				{key: "volumeDifferential5DaysColumn", label: oResourceBundle.getText("indicator.volumeDifferential5Days"), 
					path: "indicator/volumeDifferential5Days"},
				{key: "bbw10DaysColumn", label: oResourceBundle.getText("indicator.bbw10Days"), 
					path: "indicator/bollingerBandWidth10Days"},
				{key: "upDownVolumeRatioColumn", label: oResourceBundle.getText("indicator.upDownVolumeRatio"), 
					path: "indicator/upDownVolumeRatio"},
				{key: "accDisRatioColumn", label: oResourceBundle.getText("indicator.accDisRatio30Days"), 
					path: "indicator/accDisRatio30Days"},
				{key: "liquidityColumn", label: oResourceBundle.getText("indicator.liquidity"), 
					path: "indicator/liquidity20Days"},
				{key: "baseLengthWeeksColumn", label: oResourceBundle.getText("indicator.baseLengthWeeks"), 
					path: "indicator/baseLengthWeeks"},
				{key: "atrpColumn", label: oResourceBundle.getText("indicator.averageTrueRangePercent"), 
					path: "indicator/averageTrueRangePercent20"}
			]);
			
			return oMetadataHelper;
		},
		
		
		/**
		 * Gets an array of table cells based on the state of the personalization dialog.
		 */
		getTableCells: function(oState, oCallingController) {
			var aCells = oState.Columns.map(function(oColumnState) {
				var sPath = oCallingController.oMetadataHelper.getProperty(oColumnState.key).path;
				var oText;
				var oLink;
				var oObjectStatus;
				
				if (oColumnState.key === "typeColumn") {
					oText = new Text();
					oText.bindProperty("text", {
          				path: sPath,
           				formatter: oCallingController.typeTextFormatter.bind(oCallingController)
       				});
				} else if (oColumnState.key === "performance5DaysColumn" || 
					oColumnState.key === "volumeDifferential5DaysColumn" || oColumnState.key === "atrpColumn") {
					oText = new Text({
						text: "{" + sPath + "} %"
					});	
				} else if (oColumnState.key === "liquidityColumn") {
					oText = new Text({
						text: "{parts: ['" + sPath +"', 'currency'], type: 'sap.ui.model.type.Currency', formatOptions: {style : 'short'} }"
					});	
				} else if (oColumnState.key === "symbolColumn") {
					oLink = new Link({
						text: "{" + sPath + "}",
						press: oCallingController.onSymbolLinkPressed.bind(oCallingController)
					});
					
					return oLink;
				} else if (oColumnState.key === "rsNumberColumn" || oColumnState.key === "rsNumberCompositeIgColumn") {
					oObjectStatus = new ObjectStatus({
						text: "{" + sPath + "}",
						inverted: true
					});
					oObjectStatus.bindProperty("state", {
						path: sPath,
						formatter: oCallingController.rsNumberStateFormatter.bind(oCallingController)
					});
					
					return oObjectStatus;
				} else if (oColumnState.key === "upDownVolumeRatioColumn") {
					oObjectStatus = new ObjectStatus({
						text: "{" + sPath + "}"
					});
					oObjectStatus.bindProperty("state", {
						path: sPath,
						formatter: oCallingController.udVolRatioStateFormatter.bind(oCallingController)
					});
					
					return oObjectStatus;
				} else if (oColumnState.key === "distanceTo52WeekHighColumn") {
					oObjectStatus = new ObjectStatus({
						text: "{" + sPath + "} %"
					});
					oObjectStatus.bindProperty("state", {
						path: sPath,
						formatter: oCallingController.distance52wHighStateFormatter.bind(oCallingController)
					});
					
					return oObjectStatus;
				} else {
					oText = new Text({
						text: "{" + sPath + "}"
					});					
				}
	
				return oText;
			}.bind(oCallingController));
			
			return aCells;
		},
		
		
		/**
		 * Gets a chart URL for the given Instrument.
		 */
		getChartUrl: function(oInstrument, sWebServiceBaseUrl) {
			var sChartUrl = "";

			if (oInstrument.type === Constants.INSTRUMENT_TYPE.RATIO) {
				sChartUrl = this.getChartUrlRatio(oInstrument);
			}
			else {
				if (oInstrument.symbol === "") {
					sChartUrl = this.getChartUrlBackend(oInstrument, sWebServiceBaseUrl);
				} else {
					sChartUrl = this.getChartUrlNonRatio(oInstrument);
				}
			}
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets a chart URL for an Instrument of any type other than RATIO where symbol and stock exchange are given.
		 */
		getChartUrlNonRatio: function(oInstrument) {
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&id=p87853059193";
			var sChartUrl = "";
			var sStockExchange = oInstrument.stockExchange;
			var sSymbol = oInstrument.symbol;
			
			sChartUrl = sBaseChartUrl.replace("{symbol}", sSymbol);
			
			if (sStockExchange === Constants.STOCK_EXCHANGE.NYSE) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.NDQ) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.AMEX) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.OTC) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.TSX) {
				sChartUrl = sChartUrl.replace("{exchange}", ".TO");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.TSXV) {
				sChartUrl = sChartUrl.replace("{exchange}", ".V");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.CSE) {
				sChartUrl = sChartUrl.replace("{exchange}", ".CA");
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.LSE) {
				sChartUrl = sChartUrl.replace("{exchange}", ".L");
			}
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets a chart URL for an Instrument of type RATIO.
		 */
		getChartUrlRatio: function(oInstrument) {
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbolDividend}:{symbolDivisor}&p=D&yr=1&mn=0&dy=0&id=p45419491770";
			var sChartUrl = "";
			var sSymbolDividend = oInstrument.dividend.symbol;
			var sSymbolDividor = oInstrument.divisor.symbol;
			
			sChartUrl = sBaseChartUrl.replace("{symbolDividend}", sSymbolDividend);
			sChartUrl = sChartUrl.replace("{symbolDivisor}", sSymbolDividor);
						
			return sChartUrl;
		},
		
		
		/**
		 * Gets the chart URL of a backend chart for the given instrument.
		 */
		getChartUrlBackend: function(oInstrument, sWebServiceBaseUrl) {
			var sServerAddress = MainController.getServerAddress();
			var sChartUrl = sServerAddress + sWebServiceBaseUrl + "/priceVolume/" + oInstrument.id;
			
			//Append chart configuration to request URL.
			sChartUrl = sChartUrl + "?indicator=BBW&overlays=EMA_21&overlays=SMA_50&overlays=SMA_200&withVolume=true&withSma30Volume=true";
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets a URL for the earnings website of an Instrument.
		 */
		getEarningsUrl: function(oInstrument) {
			var sBaseEarningsUrl = "https://www.tipranks.com/stocks/{placeholder}/earnings";
			var sEarningsUrl = "";
			var sStockExchange = oInstrument.stockExchange;
			var sSymbol = oInstrument.symbol;
			
			if (sStockExchange === Constants.STOCK_EXCHANGE.NYSE ||
				sStockExchange === Constants.STOCK_EXCHANGE.NDQ ||
				sStockExchange === Constants.STOCK_EXCHANGE.AMEX ||
				sStockExchange === Constants.STOCK_EXCHANGE.OTC) {
					
				sEarningsUrl = sBaseEarningsUrl.replace("{placeholder}", sSymbol);
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.TSX ||
				sStockExchange === Constants.STOCK_EXCHANGE.TSXV ||
				sStockExchange === Constants.STOCK_EXCHANGE.CSE) {
					
				sEarningsUrl = sBaseEarningsUrl.replace("{placeholder}", "tse:" + sSymbol);
			}
			else if (sStockExchange === Constants.STOCK_EXCHANGE.LSE) {
				sEarningsUrl = sBaseEarningsUrl.replace("{placeholder}", "gb:" + sSymbol);
			}
			
			return sEarningsUrl;
		},
		
		
		/**
		 * Controls which instrument types are available for selection in the type ComboBox.
		 */
		enableInstrumentTypesInComboBox: function(oComboxBox, aAllowedInstrumentTypes) {
			//Set all types to invisible by default.
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.STOCK).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.ETF).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.SECTOR).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.RATIO).setEnabled(false);
			
			if (aAllowedInstrumentTypes === undefined || aAllowedInstrumentTypes.length === 0) {				
				return;
			}
				
			//Only set those types to visible, that are explicitly allowed.			
			for (var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oComboxBox.getItemByKey(aAllowedInstrumentTypes[i]).setEnabled(true);
			}
		}
	};
});