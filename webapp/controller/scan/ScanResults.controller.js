sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"./ScanController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter"
], function (Controller, MainController, Constants, ScanController, JSONModel, MessageToast, MessageBox, Sorter) {
	"use strict";
	
	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanResults", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanResultsRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTemplateComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, template_keys.ALL);
			
			this.resetUiElements();
    	},
    	
    	
    	/**
    	 * Handles the button press event of the refresh scan results button.
    	 */
    	onRefreshPressed : function() {
			var sSelectedTemplate = "";
			var oComboBox = this.getView().byId("templateComboBox");
			
			sSelectedTemplate = oComboBox.getSelectedKey();
			
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, sSelectedTemplate);
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
					
			window.open(sChartLink, '_blank');
		},
		
		
		/**
		 * Resets the UI elements into the intial state.
		 */
		resetUiElements : function() {
			var oComboBox = this.getView().byId("templateComboBox");
						
			oComboBox.setSelectedKey(Constants.SCAN_TEMPLATE.ALL);
		}
	});
});