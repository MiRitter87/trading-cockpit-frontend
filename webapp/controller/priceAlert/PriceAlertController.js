sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for alert type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "LESS_OR_EQUAL", "priceAlert.type.lessOrEqual");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "GREATER_OR_EQUAL", "priceAlert.type.greaterOrEqual");
		},
		
		
		/**
		 * Checks if a valid price is filled in.
		 */
		isPriceValid : function (sPriceInputString) {
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if(isNaN(fPricePerUnit)) {
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
		validatePriceInput : function (oPriceInput, oResourceBundle, oModel, sPricePropertyPath) {
			var sPriceInputString = oPriceInput.getValue();
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if(isNaN(fPricePerUnit)) {
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
		 * The WebService provides dates as milliseconds since 01.01.1970.
	     * This function initializes the date properties as Date objects based on the given values.
		 */
		initializeDatesAsObject : function(oPriceAlerts) {			
			for(var i = 0; i < oPriceAlerts.length; i++) {
    			var oTempPriceAlert = oPriceAlerts[i];
				var oDate;
    			
				if(oTempPriceAlert.triggerTime != null) {
					oDate = new Date(oTempPriceAlert.triggerTime);
					oTempPriceAlert.triggerTime = oDate;					
				}
				
				if(oTempPriceAlert.confirmationTime != null) {
					oDate = new Date(oTempPriceAlert.confirmationTime);
					oTempPriceAlert.confirmationTime = oDate;					
				}
			}
		},
		
		
		/**
		 * Gets the price alert data of the price alert with the given ID.
		 */
		getPriceAlertById : function(iPriceAlertId, oPriceAlerts) {
			//Get the selected price alert from the array of all price alerts according to the id.
			for(var i = 0; i < oPriceAlerts.length; i++) {
    			var oTempPriceAlert = oPriceAlerts[i];
    			
				if(oTempPriceAlert.id == iPriceAlertId) {
					return oTempPriceAlert;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns the localized text of the given stock exchange.
		 */
		getLocalizedStockExchangeText : function(sStockExchange, oResourceBundle) {
			if(sStockExchange == "NYSE")
				return oResourceBundle.getText("stockExchange.nyse");
			else if(sStockExchange == "TSX")
				return oResourceBundle.getText("stockExchange.tsx");
			else if(sStockExchange == "TSXV")
				return oResourceBundle.getText("stockExchange.tsxv");
			else
				return "";
		},
		
		
		/**
		 * Returns the localized text of the given type.
		 */
		getLocalizedTypeText : function(sType, oResourceBundle) {
			if(sType == "LESS_OR_EQUAL")
				return oResourceBundle.getText("priceAlert.type.lessOrEqual");
			else if(sType == "GREATER_OR_EQUAL")
				return oResourceBundle.getText("priceAlert.type.greaterOrEqual");
			else
				return "";
		},
		
		
		/**
		 * Calls a WebService operation to create a price alert.
		 */
		createPriceAlertByWebService : function(oPriceAlertModel, callbackFunction, oCallingController) {
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
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the price alert WebService for all price alerts.
		 */
		queryPriceAlertsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sTriggerStatus, sConfirmationStatus) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var bTriggerStatusGiven = false;
			var bConfirmationStatusGiven = false;
			
			if(sTriggerStatus != undefined && sTriggerStatus != null)
				bTriggerStatusGiven = true;
				
			if(sConfirmationStatus != undefined && sConfirmationStatus != null)
				bConfirmationStatusGiven = true;
				
			if(bTriggerStatusGiven == true) {
				sQueryUrl= sQueryUrl + "?triggerStatusQuery=" + sTriggerStatus;
				
				if(bConfirmationStatusGiven == true)
					sQueryUrl = sQueryUrl + "&confirmationStatusQuery=" + sConfirmationStatus;			
			}
			else {
				if(bConfirmationStatusGiven == true)
					sQueryUrl= sQueryUrl + "?confirmationStatusQuery=" + sConfirmationStatus;
			}
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Updates changes of the price alert data using the WebService.
		 */
		savePriceAlertByWebService : function(oPriceAlertModel, callbackFunction, oCallingController) {
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
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			}); 
		},
		
		
		/**
		 * Deletes the given price alert using the WebService.
		 */
		deletePriceAlertByWebService : function(oPriceAlert, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/priceAlert");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oPriceAlert.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		}
	};
});