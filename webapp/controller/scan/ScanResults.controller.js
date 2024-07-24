sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"./ScanController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/p13n/MetadataHelper",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/SortController",
	"sap/ui/model/Sorter",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Link",
	"sap/ui/core/library",
	"sap/ui/core/Fragment"
], function (Controller, MainController, Constants, ScanController, InstrumentController, JSONModel, MessageToast, MessageBox, 
	Filter, FilterOperator, MetadataHelper, Engine, SelectionController, SortController, Sorter, ColumnListItem, Text, 
	Button, Link, coreLibrary, Fragment) {
		
	"use strict";
	
	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanResults", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanResultsRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTemplateComboBox();
			this.initializeSettingsDialog();
			
			InstrumentController.initializeTypeComboBox(oTypeComboBox, this.getOwnerComponent().getModel("i18n").getResourceBundle());
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
		},
		
		
		/**
		 * Handles destroying of the ScanResults view.
		 */
		onExit: function () {
			this._oTPC.destroy();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, 
				Constants.SCAN_TEMPLATE.ALL, Constants.INSTRUMENT_TYPE.STOCK);
			
			this.resetUiElements();
    	},
    	
    	
    	/**
		 * Handles the selection of a scan template.
		 */
		onTemplateSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oStartDateLabel = this.getView().byId("startDateLabel");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			
			//Handle visibility of date label and picker.
			if(oSelectedItem == null) {
				oStartDateLabel.setVisible(false);
				oStartDatePicker.setVisible(false);
			}
			else if(oSelectedItem.getKey() == Constants.SCAN_TEMPLATE.RS_SINCE_DATE) {
				oStartDateLabel.setVisible(true);
				oStartDatePicker.setVisible(true);
			}
			else {
				oStartDateLabel.setVisible(false);
				oStartDatePicker.setVisible(false);
			}
			
			//Handle visibility of instrument types.
			if(oSelectedItem.getKey() == Constants.SCAN_TEMPLATE.RS_NEAR_HIGH_IG) {
				this.enableInstrumentTypesInComboBox(oTypeComboBox, [Constants.INSTRUMENT_TYPE.STOCK]);
				
				if(oTypeComboBox.getSelectedKey() != Constants.INSTRUMENT_TYPE.STOCK) {				
					oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
				}
			}
			else {
				this.enableInstrumentTypesInComboBox(oTypeComboBox, [Constants.INSTRUMENT_TYPE.STOCK,
					Constants.INSTRUMENT_TYPE.ETF, Constants.INSTRUMENT_TYPE.SECTOR,
					Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.RATIO]);
			}
		},
    	
    	
    	/**
    	 * Handles the button press event of the refresh scan results button.
    	 */
    	onRefreshPressed : function() {
			var sSelectedTemplate = "";
			var sSelectedType = "";
			var sSelectedDate = "";
			var sMinLiquidity = "";
			var sMinAtrp = "";
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oLiquidityInput = this.getView().byId("liquidityInput");
			var oAtrpInput = this.getView().byId("atrpInput");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			sSelectedTemplate = oTemplateComboBox.getSelectedKey();
			sSelectedType = oTypeComboBox.getSelectedKey();
			sSelectedDate = oStartDatePicker.getValue();
			sMinLiquidity = oLiquidityInput.getValue();
			sMinAtrp = oAtrpInput.getValue();
			
			
			if(sSelectedTemplate == "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noTemplateSelected"));
				return;
			}
			
			if(sSelectedType == "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noTypeSelected"));
				return;				
			}
				
			if(sSelectedTemplate == Constants.SCAN_TEMPLATE.RS_SINCE_DATE && sSelectedDate == "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noDateSelected"));
				return;				
			}
			
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, 
				sSelectedTemplate, sSelectedType, sSelectedDate, sMinLiquidity, sMinAtrp);
		},
		
		
		/**
    	 * Handles the button press event of the template information button.
    	 */
    	onTemplateInformationPressed : function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = "", sDescription = "";
			var sKey = "";
			
			sKey = oComboBox.getSelectedKey();
			
			if(sKey == Constants.SCAN_TEMPLATE.ALL) {
				sTitle = oResourceBundle.getText("scanResults.template.all");
				sDescription = oResourceBundle.getText("scanResults.template.all.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.BUYABLE_BASE) {
				sTitle = oResourceBundle.getText("scanResults.template.buyableBase");
				sDescription = oResourceBundle.getText("scanResults.template.buyableBase.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.MINERVINI_TREND_TEMPLATE) {
				sTitle = oResourceBundle.getText("scanResults.template.minervini");
				sDescription = oResourceBundle.getText("scanResults.template.minervini.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.CONSOLIDATION_10_WEEKS) {
				sTitle = oResourceBundle.getText("scanResults.template.consolidation10Weeks");
				sDescription = oResourceBundle.getText("scanResults.template.consolidation10Weeks.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.CONSOLIDATION_10_DAYS) {
				sTitle = oResourceBundle.getText("scanResults.template.consolidation10Days");
				sDescription = oResourceBundle.getText("scanResults.template.consolidation10Days.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.BREAKOUT_CANDIDATES) {
				sTitle = oResourceBundle.getText("scanResults.template.breakoutCandidates");
				sDescription = oResourceBundle.getText("scanResults.template.breakoutCandidates.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.UP_ON_VOLUME) {
				sTitle = oResourceBundle.getText("scanResults.template.upOnVolume");
				sDescription = oResourceBundle.getText("scanResults.template.upOnVolume.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.DOWN_ON_VOLUME) {
				sTitle = oResourceBundle.getText("scanResults.template.downOnVolume");
				sDescription = oResourceBundle.getText("scanResults.template.downOnVolume.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.NEAR_52_WEEK_HIGH) {
				sTitle = oResourceBundle.getText("scanResults.template.near52WeekHigh");
				sDescription = oResourceBundle.getText("scanResults.template.near52WeekHigh.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.NEAR_52_WEEK_LOW) {
				sTitle = oResourceBundle.getText("scanResults.template.near52WeekLow");
				sDescription = oResourceBundle.getText("scanResults.template.near52WeekLow.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.RS_SINCE_DATE) {
				sTitle = oResourceBundle.getText("scanResults.template.rsSinceDate");
				sDescription = oResourceBundle.getText("scanResults.template.rsSinceDate.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.THREE_WEEKS_TIGHT) {
				sTitle = oResourceBundle.getText("scanResults.template.threeWeeksTight");
				sDescription = oResourceBundle.getText("scanResults.template.threeWeeksTight.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.HIGH_TIGHT_FLAG) {
				sTitle = oResourceBundle.getText("scanResults.template.highTightFlag");
				sDescription = oResourceBundle.getText("scanResults.template.highTightFlag.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.SWING_TRADING_ENVIRONMENT) {
				sTitle = oResourceBundle.getText("scanResults.template.swingTradingEnvironment");
				sDescription = oResourceBundle.getText("scanResults.template.swingTradingEnvironment.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.RS_NEAR_HIGH_IG) {
				sTitle = oResourceBundle.getText("scanResults.template.rsNearHighIg");
				sDescription = oResourceBundle.getText("scanResults.template.rsNearHighIg.description");
			}
			else {
				MessageBox.information(oResourceBundle.getText("scanResults.noTemplateSelected"));
				return;
			}		
			
			mOptions.title = sTitle
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
		 * Handles the link pressed event of the symbol link.
		 */
		onSymbolLinkPressed : function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var	oControl = oEvent.getSource();
			var	oView = this.getView();

			//Open Popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "trading-cockpit-frontend.view.scan.MiniChartPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			this._pPopover.then(function(oPopover) {
				oPopover.bindElement(oContext.getPath());
				oPopover.openBy(oControl);
			});
		},
		
		
		/**
		 * Handles loading of image after the mini chart Popover has been opened.
		 */
		afterMiniChartPopoverOpened : function(oControlEvent) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/chart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			var oPopover = oControlEvent.getSource();
			var oContext = oPopover.getBindingContext();
			var oQuotationData = oContext.getObject();
			var oMiniChartImage = this.getView().byId("miniChartImage");
			
			sChartUrl = sChartUrl + "/priceVolume/mini/" + oQuotationData.instrument.id;
			
			oMiniChartImage.setSrc(sChartUrl);
		},
		
		
		/**
    	 * Handles the button pressed event of the chart button in a table row.
    	 */
    	onChartPressed : function(oControlEvent) {
			var oButtonParent = oControlEvent.getSource().getParent();
			var oContext = oButtonParent.getBindingContext();
			var oQuotationData = oContext.getObject();
			
			this.openStockChart(oQuotationData.instrument);
		},
		
		
		/**
		 * Handles the search function of the scan results table.
		 */
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oBinding = this.getView().byId("quotationTable").getBinding("items");
			
			var oFilterSymbol = new Filter("instrument/symbol", FilterOperator.Contains, sValue);
			var oFilterName = new Filter("instrument/name", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSymbol, oFilterName],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the search function in the SelectDialog for Instrument comparison.
		 */
		onCompareSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getParameter("itemsBinding");
			
			var oFilterSymbol = new Filter("instrument/symbol", FilterOperator.Contains, sValue);
			var oFilterName = new Filter("instrument/name", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSymbol, oFilterName],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the closing of the SelectDialog for Instrument comparison.
		 */
		onCompareDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oBinding = this.getView().byId("quotationTable").getBinding("items");
			var aFilterArray = new Array();
			var oSingleFilter, oTotalFilter;
			
			if (aContexts && aContexts.length) {
				for(var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					
					//Single results are compared by their Quotation ID.
					oSingleFilter = new Filter("id", FilterOperator.EQ, oContext.getObject().id);
					aFilterArray.push(oSingleFilter);
				}
				
				//Connect multiple filters of single results via logical "OR".
				var oTotalFilter = new Filter({
					filters: aFilterArray,
	    			and: false
	  			});
			}
			
			if(aFilterArray.length > 0)
				oBinding.filter([oTotalFilter]);
			else		
				oBinding.filter([]);
		},
		
		
		/**
		 * Handles the button pressed event of the compare instruments button.
		 */
		onComparePressed: function () {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.InstrumentSelectionDialog");
		},
		
		
		/**
		 * Handles the button pressed event of the settings button.
		 */
		onSettingsPressed : function(oEvent) {
			var oTable = this.byId("quotationTable");

			Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvent.getSource()
			});
		},
		
		
		/**
		 * Handles state changes of the personalization dialog.
		 */
		handleStateChange: function(oEvent) {
			var oTable = this.byId("quotationTable");
			var oState = oEvent.getParameter("state");
			var aSorter = [];
			var aCells;
			
			if (!oState) {
				return;
			}
			
			oState.Sorter.forEach(function(oSorter) {
				var oExistingSorter = aSorter.find(function(oSort){
					return oSort.sPath === this.oMetadataHelper.getProperty(oSorter.key).path;
				}.bind(this));

				if (oExistingSorter) {
					oExistingSorter.bDescending = !!oSorter.descending;
				} else {
					aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
				}
			}.bind(this));
			
			oTable.getColumns().forEach(function(oColumn){
       			oColumn.setVisible(false);
       			oColumn.setSortIndicator(coreLibrary.SortOrder.None);
    		});
    		
    		oState.Sorter.forEach(function(oSorter) {
				var oCol = this.byId(oSorter.key);
				if (oSorter.sorted !== false) {
					oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
				}
			}.bind(this));
    		    		
    		oState.Columns.forEach(function(oProp, iIndex){
        		var oCol = this.byId(oProp.key);
        		oCol.setVisible(true);

        		oTable.removeColumn(oCol);
        		oTable.insertColumn(oCol, iIndex);
    		}.bind(this));
    		
    		aCells = this.getTableCells(oState);
    		
    		oTable.bindItems({
        		templateShareable: false,
        		path: '/quotation/',
        		sorter: aSorter,
        		template: new ColumnListItem({cells: aCells})
    		});
		},
		
    	
    	/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oSearchField = oCallingController.getView().byId("resultsSearchField");
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.message != null && oReturnData.message.length > 0) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
			
			oCallingController.getView().setModel(oModel);
			
			oSearchField.setValue("");
		},
		
		
		/**
		 * Initializes the ComboBox for Scan template selection.
		 */
		initializeTemplateComboBox : function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.ALL, "scanResults.template.all");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.BUYABLE_BASE, "scanResults.template.buyableBase");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.BREAKOUT_CANDIDATES, "scanResults.template.breakoutCandidates");
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
		 * Initializes the dialog for settings (Personalization).
		 */
		initializeSettingsDialog : function() {
			var oTable = this.byId("quotationTable");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			this.oMetadataHelper = new MetadataHelper([
				{key: "symbolColumn", label: oResourceBundle.getText("instrument.symbol"), path: "instrument/symbol"},
				{key: "nameColumn", label: oResourceBundle.getText("instrument.name"), path: "instrument/name"},
				{key: "typeColumn", label: oResourceBundle.getText("instrument.type"), path: "instrument/type"},
				{key: "rsNumberColumn", label: oResourceBundle.getText("indicator.rsNumber"), path: "relativeStrengthData/rsNumber"},
				{key: "rsNumberCompositeIgColumn", label: oResourceBundle.getText("indicator.rsNumberCompositeIg"), 
					path: "relativeStrengthData/rsNumberCompositeIg"},
				{key: "sectorRsNumberColumn", label: oResourceBundle.getText("indicator.sectorRsNumber"), 
					path: "relativeStrengthData/rsNumberSector"},
				{key: "industryGroupRsNumberColumn", label: oResourceBundle.getText("indicator.industryGroupRsNumber"), 
					path: "relativeStrengthData/rsNumberIndustryGroup"},
				{key: "distanceTo52WeekHighColumn", label: oResourceBundle.getText("indicator.distanceTo52WeekHigh"), 
					path: "indicator/distanceTo52WeekHigh"},
				{key: "performance5DaysColumn", label: oResourceBundle.getText("indicator.performance5Days"), path: "indicator/performance5Days"},
				{key: "volumeDifferential5DaysColumn", label: oResourceBundle.getText("indicator.volumeDifferential5Days"), 
					path: "indicator/volumeDifferential5Days"},
				{key: "bbw10DaysColumn", label: oResourceBundle.getText("indicator.bbw10Days"), 
					path: "indicator/bollingerBandWidth10Days"},
				{key: "upDownVolumeRatioColumn", label: oResourceBundle.getText("indicator.upDownVolumeRatio"), 
					path: "indicator/upDownVolumeRatio"},
				{key: "liquidityColumn", label: oResourceBundle.getText("indicator.liquidity"), path: "indicator/liquidity20Days"},
				{key: "baseLengthWeeksColumn", label: oResourceBundle.getText("indicator.baseLengthWeeks"), path: "indicator/baseLengthWeeks"},
				{key: "atrpColumn", label: oResourceBundle.getText("indicator.averageTrueRangePercent"), path: "indicator/averageTrueRangePercent20"},
				{key: "chartColumn", label: oResourceBundle.getText("scanResults.chart"), path: ""}
			]);
			
			Engine.getInstance().register(oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: oTable
					}),
        			Sorter: new SortController({
            			control: oTable
        			})
				}
			});
			
			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},
		
		
		/**
		 * Opens the stock chart of the given Instrument.
		 */
		openStockChart : function(oInstrument) {
			var sChartUrl = this.getChartUrl(oInstrument);
					
			window.open(sChartUrl, '_blank');
		},
		
		
		/**
		 * Gets a chart URL for the given Instrument.
		 */
		getChartUrl : function(oInstrument) {
			var sChartUrl = "";

			if(oInstrument.type == Constants.INSTRUMENT_TYPE.RATIO) {
				sChartUrl = this.getChartUrlRatio(oInstrument);
			}
			else {
				sChartUrl = this.getChartUrlNonRatio(oInstrument);
			}
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets a chart URL for an Instrument of any type other than RATIO.
		 */
		getChartUrlNonRatio : function(oInstrument) {
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&id=p45419491770";
			var sChartUrl = "";
			var sStockExchange = oInstrument.stockExchange;
			var sSymbol = oInstrument.symbol;
			
			sChartUrl = sBaseChartUrl.replace("{symbol}", sSymbol);
			
			if(sStockExchange == Constants.STOCK_EXCHANGE.NYSE) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.NDQ) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.AMEX) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.OTC) {
				sChartUrl = sChartUrl.replace("{exchange}", "");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSX) {
				sChartUrl = sChartUrl.replace("{exchange}", ".TO");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSXV) {
				sChartUrl = sChartUrl.replace("{exchange}", ".V");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.CSE) {
				sChartUrl = sChartUrl.replace("{exchange}", ".CA");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.LSE) {
				sChartUrl = sChartUrl.replace("{exchange}", ".L");
			}
			
			return sChartUrl;
		},
		
		
		/**
		 * Gets a chart URL for an Instrument of type RATIO.
		 */
		getChartUrlRatio : function(oInstrument) {
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbolDividend}:{symbolDivisor}&p=D&yr=1&mn=0&dy=0&id=p45419491770";
			var sChartUrl = "";
			var sSymbolDividend = oInstrument.dividend.symbol;
			var sSymbolDividor = oInstrument.divisor.symbol;
			
			sChartUrl = sBaseChartUrl.replace("{symbolDividend}", sSymbolDividend);
			sChartUrl = sChartUrl.replace("{symbolDivisor}", sSymbolDividor);
						
			return sChartUrl;
		},
		
		
		/**
		 * Gets an array of table cells based on the state of the personalization dialog.
		 */
		getTableCells : function(oState) {
			var aCells = oState.Columns.map(function(oColumnState) {
				var sPath = this.oMetadataHelper.getProperty(oColumnState.key).path;
				var oText;
				var oButton;
				var oLink;
				
				if(oColumnState.key == "typeColumn") {
					oText = new Text();
					oText.bindProperty("text", {
          				path: sPath,
           				formatter: this.typeTextFormatter.bind(this)
       				});
				} else if(oColumnState.key == "performance5DaysColumn" || oColumnState.key == "distanceTo52WeekHighColumn"
					|| oColumnState.key == "volumeDifferential5DaysColumn" || oColumnState.key == "atrpColumn") {
					oText = new Text({
						text: "{" + sPath + "} %"
					});	
				} else if(oColumnState.key == "liquidityColumn") {
					oText = new Text({
						text: "{parts: ['" + sPath +"', 'currency'], type: 'sap.ui.model.type.Currency', formatOptions: {style : 'short'} }"
					});	
				} else if(oColumnState.key == "chartColumn") {
					oButton = new Button({
						icon: "sap-icon://business-objects-experience",
						press: this.onChartPressed.bind(this),
						tooltip: "{i18n>scanResults.chart.tooltip}"
					});
					
					return oButton;
				} else if(oColumnState.key == "symbolColumn") {
					oLink = new Link({
						text: "{" + sPath + "}",
						press: this.onSymbolLinkPressed.bind(this)
					});
					
					return oLink;
				} else {
					oText = new Text({
						text: "{" + sPath + "}"
					});					
				}
	
				return oText;
			}.bind(this));
			
			return aCells;
		},
		
		
		/**
		 * Resets the UI elements into the intial state.
		 */
		resetUiElements : function() {
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oStartDateLabel = this.getView().byId("startDateLabel");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oLiquidityInput = this.getView().byId("liquidityInput");
			var oSearchField = this.getView().byId("resultsSearchField");
						
			oTemplateComboBox.setSelectedKey(Constants.SCAN_TEMPLATE.ALL);
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
			
			oStartDateLabel.setVisible(false);
			oStartDatePicker.setVisible(false);
			
			oLiquidityInput.setValue("");
			
			oSearchField.setValue("");
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Controls which instrument types are available for selection in the type ComboBox.
		 */
		enableInstrumentTypesInComboBox : function (oComboxBox, aAllowedInstrumentTypes) {
			//Set all types to invisible by default.
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.STOCK).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.ETF).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.SECTOR).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP).setEnabled(false);
			oComboxBox.getItemByKey(Constants.INSTRUMENT_TYPE.RATIO).setEnabled(false);
			
			if(aAllowedInstrumentTypes == undefined || aAllowedInstrumentTypes.length == 0)
				return;
				
			//Only set those types to visible, that are explicitly allowed.			
			for(var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oComboxBox.getItemByKey(aAllowedInstrumentTypes[i]).setEnabled(true);
			}
		}
	});
});