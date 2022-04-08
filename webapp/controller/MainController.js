sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	
	return {
		/**
		 * Navigates to the startpage.
		 */
		navigateToStartpage : function(oRouter) {
			oRouter.navTo("startPageRoute");		
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
		 * Gets the server address including the port.
		 */
		getServerAddress : function() {
			var sServerAddress = window.location.origin;
			return sServerAddress;
		}
	};
});