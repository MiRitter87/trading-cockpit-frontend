sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"./Constants",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Fragment, Item, Constants, Filter, FilterOperator) {
	"use strict";
	
	return {
		/**
		 * Opens the fragment with the given name as PopUp.
		 */
		openFragmentAsPopUp: function(oController, sName, callbackFunction) {
			var oView = oController.getView();
			var oDialogOfMap;
			
			if (!oController.oDialogMap) {				
				oController.oDialogMap = new Map();
			}
				
			oDialogOfMap = oController.oDialogMap.get(sName);
			
			if (oDialogOfMap === undefined) {
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
				if (callbackFunction !== undefined) {					
					callbackFunction(oController);
				}
			});
		},


		/**
		 * Navigates to the startpage.
		 */
		navigateToStartpage: function(oRouter) {
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Initializes the given ComboBox with items for stock exchange selection.
		 */
		initializeStockExchangeComboBox: function(oComboBox, oResourceBundle) {
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
		 * Initializes the ComboBox of the health check profile.
		 */
		initializeHealthCheckProfileComboBox: function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.ALL, "healthCheckProfile.all");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS, "healthCheckProfile.confirmations");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS, "healthCheckProfile.weakness");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH, "healthCheckProfile.strength");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.ALL_WITHOUT_COUNTING, "healthCheckProfile.allWithoutCounting")
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS_WITHOUT_COUNTING, "healthCheckProfile.confirmationsWithoutCounting");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.WEAKNESS_WITHOUT_COUNTING, "healthCheckProfile.weaknessWithoutCounting");
				
			this.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.HEALTH_CHECK_PROFILE.AFTER_BREAKOUT, "healthCheckProfile.afterBreakout");
		},
		
		
		/**
		 * Adds an item to a ComboBox.
		 */
		addItemToComboBox: function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Returns the localized text of the given stock exchange.
		 */
		getLocalizedStockExchangeText: function(sStockExchange, oResourceBundle) {
			if (sStockExchange === Constants.STOCK_EXCHANGE.NYSE) {				
				return oResourceBundle.getText("stockExchange.nyse");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.NDQ) {				
				return oResourceBundle.getText("stockExchange.ndq");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.AMEX) {				
				return oResourceBundle.getText("stockExchange.amex");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.OTC) {				
				return oResourceBundle.getText("stockExchange.otc");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.TSX) {				
				return oResourceBundle.getText("stockExchange.tsx");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.TSXV) {				
				return oResourceBundle.getText("stockExchange.tsxv");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.CSE) {				
				return oResourceBundle.getText("stockExchange.cse");
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.LSE) {				
				return oResourceBundle.getText("stockExchange.lse");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Returns the localized title of the given health check profile.
		 */
		getTitleOfHealthCheckProfile: function(sProfile, oResourceBundle) {
			var sTitle = "";
			
			if (sProfile === Constants.HEALTH_CHECK_PROFILE.ALL) {
				sTitle = oResourceBundle.getText("healthCheckProfile.all");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS) {
				sTitle = oResourceBundle.getText("healthCheckProfile.confirmations");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS) {
				sTitle = oResourceBundle.getText("healthCheckProfile.weakness");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH) {
				sTitle = oResourceBundle.getText("healthCheckProfile.strength");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.ALL_WITHOUT_COUNTING) {
				sTitle = oResourceBundle.getText("healthCheckProfile.allWithoutCounting");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS_WITHOUT_COUNTING) {
				sTitle = oResourceBundle.getText("healthCheckProfile.confirmationsWithoutCounting");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.WEAKNESS_WITHOUT_COUNTING) {
				sTitle = oResourceBundle.getText("healthCheckProfile.weaknessWithoutCounting");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.AFTER_BREAKOUT) {
				sTitle = oResourceBundle.getText("healthCheckProfile.afterBreakout");
			}
			
			return sTitle;
		},
		
		/**
		 * Returns the localized description of the given health check profile.
		 */
		getDescriptionOfHealthCheckProfile: function(sProfile, oResourceBundle) {
			var sDescription = "";
			
			if (sProfile === Constants.HEALTH_CHECK_PROFILE.ALL) {
				sDescription = oResourceBundle.getText("healthCheckProfile.all.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS) {
				sDescription = oResourceBundle.getText("healthCheckProfile.confirmations.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS) {
				sDescription = oResourceBundle.getText("healthCheckProfile.weakness.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH) {
				sDescription = oResourceBundle.getText("healthCheckProfile.strength.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.ALL_WITHOUT_COUNTING) {
				sDescription = oResourceBundle.getText("healthCheckProfile.allWithoutCounting.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS_WITHOUT_COUNTING) {
				sDescription = oResourceBundle.getText("healthCheckProfile.confirmationsWithoutCounting.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.WEAKNESS_WITHOUT_COUNTING) {
				sDescription = oResourceBundle.getText("healthCheckProfile.weaknessWithoutCounting.description");
			}
			else if (sProfile === Constants.HEALTH_CHECK_PROFILE.AFTER_BREAKOUT) {
				sDescription = oResourceBundle.getText("healthCheckProfile.afterBreakout.description");
			}
			
			return sDescription;
		},
		
		
		/**
		 * Gets the server address including the port.
		 */
		getServerAddress: function() {
			var sServerAddress = window.location.origin;
			return sServerAddress;
		},
		
		
		/**
		 * Applies a Filter to the ComboBox for Instrument selection.
		 */
		applyFilterToInstrumentsComboBox: function(oComboxBox, sTypePath, aAllowedInstrumentTypes) {
			var oBinding = oComboxBox.getBinding("items");
			var aFilters = new Array();
			var oFilterType, oFilterTotal;
			
			if (aAllowedInstrumentTypes === undefined || aAllowedInstrumentTypes.length === 0) {				
				return;
			}
				
			for (var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oFilterType = new Filter(sTypePath, FilterOperator.EQ, aAllowedInstrumentTypes[i]);
				aFilters.push(oFilterType);
			}
			
			if (oBinding === undefined)
				return;
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: aFilters,
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		}
	};
});