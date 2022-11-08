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
	"./ScanResultsPersoService"
], function (Controller, MainController, Constants, ScanController, InstrumentController, JSONModel, MessageToast, MessageBox, Sorter, 
	TablePersoController, ScanResultsPersoService) {
		
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
    	 * Handles the button press event of the refresh scan results button.
    	 */
    	onRefreshPressed : function() {
			var sSelectedTemplate = "";
			var sSelectedType = "";
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			sSelectedTemplate = oTemplateComboBox.getSelectedKey();
			sSelectedType = oTypeComboBox.getSelectedKey();
			
			if(sSelectedType == "")
				MessageBox.information(oResourceBundle.getText("scanResults.noTypeSelected"));
			
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, sSelectedTemplate, sSelectedType);
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
			
			this.openStockChart(oQuotationData.instrument.symbol, oQuotationData.instrument.stockExchange);
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
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
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
		},
		
		
		/**
		 * Initializes the dialog for column settings.
		 */
		initializeColumnSettingsDialog : function() {
			this._oTPC = new TablePersoController({
				table: this.byId("quotationTable"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "trading-cockpit-frontend",
				persoService: ScanResultsPersoService
			}).activate();
		},
		
		
		/**
		 * Opens the stock chart of the given symbol.
		 */
		openStockChart : function(sSymbol, sStockExchange) {
			var sBaseChartLink = "https://stockcharts.com/h-sc/ui?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&id=p79905824963";
			var sChartLink = "";
			
			sChartLink = sBaseChartLink.replace("{symbol}", sSymbol);
			
			if(sStockExchange == Constants.STOCK_EXCHANGE.NYSE) {
				sChartLink = sChartLink.replace("{exchange}", "");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSX) {
				sChartLink = sChartLink.replace("{exchange}", ".TO");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSXV) {
				sChartLink = sChartLink.replace("{exchange}", ".V");
			}
			else if(sStockExchange == Constants.STOCK_EXCHANGE.CSE) {
				sChartLink = sChartLink.replace("{exchange}", ".CA");
			}
					
			window.open(sChartLink, '_blank');
		},
		
		
		/**
		 * Resets the UI elements into the intial state.
		 */
		resetUiElements : function() {
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
						
			oTemplateComboBox.setSelectedKey(Constants.SCAN_TEMPLATE.ALL);
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		}
	});
});