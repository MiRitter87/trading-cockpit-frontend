sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./ScanController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter"
], function (Controller, MainController, ScanController, JSONModel, MessageToast, Sorter) {
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
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, "ALL");
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
				oCallingController.updateHeaderText(oModel, oCallingController);
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
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "ALL", "scanResults.template.all");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "MINERVINI_TREND_TEMPLATE", "scanResults.template.minervini");
		},
		
		
		/**
		 * Opens the stock chart of the given symbol.
		 */
		openStockChart : function(sSymbol, sStockExchange) {
			var sBaseChartLink = "https://stockcharts.com/h-sc/ui?s={symbol}{exchange}&p=D&yr=1&mn=0&dy=0&id=p79905824963";
			var sChartLink = "";
			
			sChartLink = sBaseChartLink.replace("{symbol}", sSymbol);
			
			if(sStockExchange == "NYSE") {
				sChartLink = sChartLink.replace("{exchange}", "");
			}
			else if(sStockExchange == "TSX") {
				sChartLink = sChartLink.replace("{exchange}", ".TO");
			}
			else if(sStockExchange == "TSXV") {
				sChartLink = sChartLink.replace("{exchange}", ".V");
			}
					
			window.open(sChartLink, '_blank');
		},
		
		
		/**
		 * Updates the text of the table header.
		 */
		updateHeaderText : function(oModel, oCallingController) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModelData = oModel.getData();
			var	rowCount = oModelData.quotation.length;
			var sText;
			
			sText= oResourceBundle.getText("scanResults.tableHeader", rowCount.toString());
			oCallingController.getView().byId("tableHeaderText").setText(sText);
		}
	});
});