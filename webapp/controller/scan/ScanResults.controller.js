sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"./ScanController",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/m/TablePersoController",
	"./ScanResultsPersoService",
	'sap/m/library',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MainController, Constants, ScanController, InstrumentController, JSONModel, MessageToast, MessageBox, Sorter, 
	TablePersoController, ScanResultsPersoService, mlibrary, Filter, FilterOperator) {
		
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
			this.initializeColumnSettingsDialog();
			
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
		},
    	
    	
    	/**
    	 * Handles the button press event of the refresh scan results button.
    	 */
    	onRefreshPressed : function() {
			var sSelectedTemplate = "";
			var sSelectedType = "";
			var sSelectedDate = "";
			var sMinLiquidity = "";
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oLiquidityInput = this.getView().byId("liquidityInput");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			sSelectedTemplate = oTemplateComboBox.getSelectedKey();
			sSelectedType = oTypeComboBox.getSelectedKey();
			sSelectedDate = oStartDatePicker.getValue();
			sMinLiquidity = oLiquidityInput.getValue();
			
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
				sSelectedTemplate, sSelectedType, sSelectedDate, sMinLiquidity);
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
			else if(sKey == Constants.SCAN_TEMPLATE.MINERVINI_TREND_TEMPLATE) {
				sTitle = oResourceBundle.getText("scanResults.template.minervini");
				sDescription = oResourceBundle.getText("scanResults.template.minervini.description");
			}
			else if(sKey == Constants.SCAN_TEMPLATE.VOLATILITY_CONTRACTION_10_DAYS) {
				sTitle = oResourceBundle.getText("scanResults.template.volContraction10Days");
				sDescription = oResourceBundle.getText("scanResults.template.volContraction10Days.description");
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
			else {
				MessageBox.information(oResourceBundle.getText("scanResults.noTemplateSelected"));
				return;
			}		
			
			mOptions.title = sTitle
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
    	 * Handles the button pressed event of the chart button in a table row.
    	 */
    	onChartPressed : function(oControlEvent) {
			var oButtonParent = oControlEvent.getSource().getParent();
			var oContext = oButtonParent.getBindingContext("quotations");
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
				
			this.updateResultTableTitle();
		},
		
		
		/**
		 * Handles the button pressed event of the compare instruments button.
		 */
		onComparePressed: function () {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.InstrumentSelectionDialog");
		},
		
		
		/**
		 * Handles the button pressed event of the column settings button.
		 */
		onColumnSettingsPressed : function() {
			this._oTPC.openDialog();
		},
		
		
		/**
		 * Handles the button pressed event of the sort button.
		 */
		onSortPressed : function() {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.ScanResultsSort");
		},
		
		
		/**
		 * Handles the confirmation of the sort dialog.
		 */
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("quotationTable");
			var	mParams = oEvent.getParameters();
			var	oBinding = oTable.getBinding("items");
			var	sPath, bDescending,	aSorters = [];
			
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
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
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
			
			oSearchField.setValue("");
		},
		
		
		/**
		 * Initializes the ComboBox for Scan template selection.
		 */
		initializeTemplateComboBox : function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.ALL, "scanResults.template.all");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.MINERVINI_TREND_TEMPLATE, "scanResults.template.minervini");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.VOLATILITY_CONTRACTION_10_DAYS, "scanResults.template.volContraction10Days");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.BREAKOUT_CANDIDATES, "scanResults.template.breakoutCandidates");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.UP_ON_VOLUME, "scanResults.template.upOnVolume");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.DOWN_ON_VOLUME, "scanResults.template.downOnVolume");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.NEAR_52_WEEK_HIGH, "scanResults.template.near52WeekHigh");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.NEAR_52_WEEK_LOW, "scanResults.template.near52WeekLow");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.RS_SINCE_DATE, "scanResults.template.rsSinceDate");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.THREE_WEEKS_TIGHT, "scanResults.template.threeWeeksTight");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.SCAN_TEMPLATE.HIGH_TIGHT_FLAG, "scanResults.template.highTightFlag");
		},
		
		
		/**
		 * Initializes the dialog for column settings.
		 */
		initializeColumnSettingsDialog : function() {
			var ResetAllMode =  mlibrary.ResetAllMode;
			
			this._oTPC = new TablePersoController({
				table: this.byId("quotationTable"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "trading-cockpit-frontend",
				resetAllMode: ResetAllMode.ServiceReset,
				persoService: ScanResultsPersoService
			}).activate();
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
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&id=p79905824963";
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
			var sBaseChartUrl = "https://stockcharts.com/h-sc/ui?s={symbolDividend}:{symbolDivisor}&p=D&yr=1&mn=0&dy=0&id=p79905824963";
			var sChartUrl = "";
			var sSymbolDividend = oInstrument.dividend.symbol;
			var sSymbolDividor = oInstrument.divisor.symbol;
			
			sChartUrl = sBaseChartUrl.replace("{symbolDividend}", sSymbolDividend);
			sChartUrl = sChartUrl.replace("{symbolDivisor}", sSymbolDividor);
						
			return sChartUrl;
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
		}
	});
});