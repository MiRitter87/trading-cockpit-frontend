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
		openFragmentAsPopUp : function (oController, sName, callbackFunction) {
			var oView = oController.getView();
			var oDialogOfMap;
			
			if(!oController.oDialogMap)
				oController.oDialogMap = new Map();
				
			oDialogOfMap = oController.oDialogMap.get(sName);
			
			if(oDialogOfMap === undefined) {
				oDialogOfMap = Fragment.load({
					id: oView.getId(),
					name: sName,
					controller: oController
				}).then(function (oDialog) {
					//connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
				
				oController.oDialogMap.set(sName, oDialogOfMap);				
			}
			
			oDialogOfMap.then(function(oDialog) {
				oDialog.open();
				
				//This callback function is executed optionally, after the Fragment has been fully initialized and opened.
				if(callbackFunction != undefined)
					callbackFunction(oController);
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
			
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.NYSE, "stockExchange.nyse");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.NDQ, "stockExchange.ndq");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.AMEX, "stockExchange.amex");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.OTC, "stockExchange.otc");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.TSX, "stockExchange.tsx");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.TSXV, "stockExchange.tsxv");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.CSE, "stockExchange.cse");
			this.addItemToComboBox(oComboBox, oResourceBundle, Constants.STOCK_EXCHANGE.LSE, "stockExchange.lse");
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
			else if(sStockExchange == Constants.STOCK_EXCHANGE.NDQ)
				return oResourceBundle.getText("stockExchange.ndq");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.AMEX)
				return oResourceBundle.getText("stockExchange.amex");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.OTC)
				return oResourceBundle.getText("stockExchange.otc");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSX)
				return oResourceBundle.getText("stockExchange.tsx");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.TSXV)
				return oResourceBundle.getText("stockExchange.tsxv");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.CSE)
				return oResourceBundle.getText("stockExchange.cse");
			else if(sStockExchange == Constants.STOCK_EXCHANGE.LSE)
				return oResourceBundle.getText("stockExchange.lse");
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