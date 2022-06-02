sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for isntrument type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "STOCK", "instrument.type.stock");
		},
		
		
		/**
		 * Gets the instrument data of the instrument with the given ID.
		 */
		getInstrumentById : function(iInstrumentId, oInstruments) {
			//Get the selected instrument from the array of all instruments according to the id.
			for(var i = 0; i < oInstruments.length; i++) {
    			var oTempInstrument = oInstruments[i];
    			
				if(oTempInstrument.id == iInstrumentId) {
					return oTempInstrument;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns the localized text of the given type.
		 */
		getLocalizedTypeText : function(sType, oResourceBundle) {
			if(sType == "STOCK")
				return oResourceBundle.getText("instrument.type.stock");
			else
				return "";
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
		},
		
		
		/**
		 * Queries the instrument WebService for all instruments.
		 */
		queryInstrumentsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			
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
		 * Updates changes of the instrument data using the WebService.
		 */
		saveInstrumentByWebService : function(oInstrumentModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oInstrumentModel.getJSON();
			
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
		}
	};
});