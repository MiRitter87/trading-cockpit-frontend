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
		}
	};
});