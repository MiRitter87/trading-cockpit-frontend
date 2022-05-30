sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for stock exchange selection.
		 */
		initializeStockExchangeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "TSX", "stockExchange.tsx");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "TSXV", "stockExchange.tsxv");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "NYSE", "stockExchange.nyse");
		},
		
		
		/**
		 * Initializes the given ComboBox with items for isntrument type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "STOCK", "instrument.type.stock");
		},
		
		
		/**
		 * Calls a WebService operation to create an instrument.
		 */
		createInstrumentByWebService : function(oInstrumentModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oInstrumentModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		}
	};
});