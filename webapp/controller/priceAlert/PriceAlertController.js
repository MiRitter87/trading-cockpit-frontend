sap.ui.define([
	"../MainController",
	"../Constants",
	"sap/ui/model/json/JSONModel"
], function(MainController, Constants, JSONModel) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for alert type selection.
		 */
		initializeTypeComboBox: function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.ALERT_TYPE.LESS_OR_EQUAL, "priceAlert.type.lessOrEqual");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.ALERT_TYPE.GREATER_OR_EQUAL, "priceAlert.type.greaterOrEqual");
		},
		
		
		/**
		 * Checks if a valid price is filled in.
		 */
		isPriceValid: function(sPriceInputString) {
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if (isNaN(fPricePerUnit)) {
				return false;
			}
			else {
				return true;
			}
		},
		
		
		/**
		 * Validates the given price input field.
		 *
		 * There is a bug in german locale when defining an Input as Number of type float.
		 * This is because the framework has a problem with the german delimiter ',' for fractional digits.
		 * See ticket here: https://github.com/SAP/openui5/issues/2558.
		 *
         * Therefore the Input is set as type String and the price is parsed manually in this function.
		 */
		validatePriceInput: function(oPriceInput, oResourceBundle, oModel, sPricePropertyPath) {
			var sPriceInputString = oPriceInput.getValue();
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if (isNaN(fPricePerUnit)) {
				oPriceInput.setValueState(sap.ui.core.ValueState.Error);
				oPriceInput.setValueStateText(oResourceBundle.getText("error.useDecimalPlaces"));
				oModel.setProperty(sPricePropertyPath, 0);
			}
			else {
				oPriceInput.setValueState(sap.ui.core.ValueState.None);
				oModel.setProperty(sPricePropertyPath, fPricePerUnit);			
			}
		},
		
		
		/**
		 * Gets the price alert data of the price alert with the given ID.
		 */
		getPriceAlertById: function(iPriceAlertId, aPriceAlerts) {
			//Get the selected price alert from the array of all price alerts according to the id.
			for (var i = 0; i < aPriceAlerts.length; i++) {
    			var oTempPriceAlert = aPriceAlerts[i];
    			
				if (oTempPriceAlert.id === iPriceAlertId) {
					return oTempPriceAlert;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns the localized text of the given type.
		 */
		getLocalizedTypeText: function(sType, oResourceBundle) {
			if (sType === Constants.ALERT_TYPE.LESS_OR_EQUAL) {				
				return oResourceBundle.getText("priceAlert.type.lessOrEqual");
			} else if (sType === Constants.ALERT_TYPE.GREATER_OR_EQUAL) {				
				return oResourceBundle.getText("priceAlert.type.greaterOrEqual");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Returns the currency for the given stock exchange.
		 */
		getCurrencyForStockExchange: function(sStockExchange) {
			if (sStockExchange === Constants.STOCK_EXCHANGE.NYSE) {				
				return Constants.CURRENCY.USD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.NDQ) {				
				return Constants.CURRENCY.USD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.AMEX) {				
				return Constants.CURRENCY.USD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.OTC) {				
				return Constants.CURRENCY.USD;	
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.TSX) {				
				return Constants.CURRENCY.CAD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.TSXV) {				
				return Constants.CURRENCY.CAD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.CSE) {				
				return Constants.CURRENCY.CAD;
			} else if (sStockExchange === Constants.STOCK_EXCHANGE.LSE) {				
				return Constants.CURRENCY.GBP;
			} else {
				return null;
			}
		},
		
		
		/**
		 * returns the display text for the given currency code.
		 */
		getCurrencyDisplayText: function(sCurrencyCode) {
			if (sCurrencyCode === Constants.CURRENCY.GBP) {				
				return "GBp";
			} else {				
				return sCurrencyCode;
			}
		},
		
		
		/**
		 * Creates a representation of a price alert that can be processed by the WebService.
		 */
		getPriceAlertForWebService: function(oPriceAlert) {
			var oPriceAlertWs = new JSONModel();
			
			oPriceAlertWs.setProperty("/id", oPriceAlert.id);
			oPriceAlertWs.setProperty("/alertType", oPriceAlert.alertType);
			oPriceAlertWs.setProperty("/price", oPriceAlert.price);
			oPriceAlertWs.setProperty("/currency", oPriceAlert.currency);
			oPriceAlertWs.setProperty("/triggerDistancePercent", oPriceAlert.triggerDistancePercent);
			oPriceAlertWs.setProperty("/triggerTime", oPriceAlert.triggerTime);
			oPriceAlertWs.setProperty("/confirmationTime", oPriceAlert.confirmationTime);
			oPriceAlertWs.setProperty("/lastStockQuoteTime", oPriceAlert.lastStockQuoteTime);
			oPriceAlertWs.setProperty("/sendMail", oPriceAlert.sendMail);
			oPriceAlertWs.setProperty("/alertMailAddress", oPriceAlert.alertMailAddress);
			oPriceAlertWs.setProperty("/mailTransmissionTime", oPriceAlert.mailTransmissionTime);
			
			oPriceAlertWs.setProperty("/instrumentId", oPriceAlert.instrument.id);
			
			return oPriceAlertWs;
		},
		
		
		/**
		 * Calls a WebService operation to create a price alert.
		 */
		createPriceAlertByWebService: function(oPriceAlertModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oPriceAlertModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the price alert WebService for all price alerts.
		 */
		queryPriceAlertsByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, sTriggerStatus, sConfirmationStatus) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var bTriggerStatusGiven = false;
			var bConfirmationStatusGiven = false;
			
			if (sTriggerStatus !== undefined && sTriggerStatus !== null) {				
				bTriggerStatusGiven = true;
			}
				
			if (sConfirmationStatus !== undefined && sConfirmationStatus !== null) {				
				bConfirmationStatusGiven = true;
			}
				
			if (bTriggerStatusGiven === true) {
				sQueryUrl= sQueryUrl + "?triggerStatusQuery=" + sTriggerStatus;
				
				if (bConfirmationStatusGiven === true) {					
					sQueryUrl = sQueryUrl + "&confirmationStatusQuery=" + sConfirmationStatus;			
				}
			} else {
				if (bConfirmationStatusGiven === true) {					
					sQueryUrl= sQueryUrl + "?confirmationStatusQuery=" + sConfirmationStatus;
				}
			}
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Updates changes of the price alert data using the WebService.
		 */
		savePriceAlertByWebService: function(oPriceAlertModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oPriceAlertModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			}); 
		},
		
		
		/**
		 * Deletes the given price alert using the WebService.
		 */
		deletePriceAlertByWebService: function(oPriceAlert, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oPriceAlert.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Exports all price alerts using the WebService.
		 */
		exportPriceAlertsByWebService: function(oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/export";
			var sFileName = "PriceAlerts.json";

			fetch(sQueryUrl)
				.then(resp => resp.blob())
				.then(blob => {
				    const url = window.URL.createObjectURL(blob);
				    const a = document.createElement('a');
				    a.style.display = 'none';
				    a.href = url;
				    a.download = sFileName;
				    document.body.appendChild(a);
				    a.click();
				    window.URL.revokeObjectURL(url);
				});
		}
	};
});