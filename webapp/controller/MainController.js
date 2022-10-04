sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"./Constants",
], function (Fragment, Item, Constants) {
	"use strict";
	
	return {
		/**
		 * Opens the fragment with the given name as PopUp.
		 */
		openFragmentAsPopUp : function (oController, sName) {
			var oView = oController.getView();
			
			//create dialog lazily
			if (!oController.pDialog) {
				oController.pDialog = Fragment.load({
					id: oView.getId(),
					name: sName,
					controller: oController
				}).then(function (oDialog) {
					//connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			oController.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},


		/**
		 * Navigates to the startpage.
		 */
		navigateToStartpage : function(oRouter) {
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Initializes the given ComboBox with items for stock exchange selection.
		 */
		initializeStockExchangeComboBox : function(oComboBox, oResourceBundle) {
			
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.TSX, "stockExchange.tsx");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.TSXV, "stockExchange.tsxv");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.CSE, "stockExchange.cse");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.NYSE, "stockExchange.nyse");
		},
		
		
		/**
		 * Adds an item to a ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Returns the localized text of the given stock exchange.
		 */
		getLocalizedStockExchangeText : function(sStockExchange, oResourceBundle) {
			if(sStockExchange == Constants.STOCK_EXCHANGE.NYSE)
				return oResourceBundle.getText("stockExchange.nyse");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSX)
				return oResourceBundle.getText("stockExchange.tsx");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSXV)
				return oResourceBundle.getText("stockExchange.tsxv");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.CSE)
				return oResourceBundle.getText("stockExchange.cse");
			else
				return "";
		},
		
		
		/**
		 * Gets the server address including the port.
		 */
		getServerAddress : function() {
			var sServerAddress = window.location.origin;
			return sServerAddress;
		}
	};
});