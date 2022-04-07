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
		 * Initializes the given ComboBox with items for alert type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "LESS_OR_EQUAL", "priceAlert.type.lessOrEqual");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "GREATER_OR_EQUAL", "priceAlert.type.greaterOrEqual");
		},
	};
});