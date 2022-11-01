sap.ui.define([
	"../MainController",
	"../Constants"
], function (MainController, Constants) {
	"use strict";
	
	return {
		/**
		 * Initializes the given ComboBox with items for instrument type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.STOCK, "instrument.type.stock");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.ETF, "instrument.type.etf");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.SECTOR, "instrument.type.sector");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, "instrument.type.industryGroup");
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
			if(sType == Constants.INSTRUMENT_TYPE.STOCK)
				return oResourceBundle.getText("instrument.type.stock");
			else if(sType == Constants.INSTRUMENT_TYPE.ETF)
				return oResourceBundle.getText("instrument.type.etf");
			else if(sType == Constants.INSTRUMENT_TYPE.SECTOR)
				return oResourceBundle.getText("instrument.type.sector");
				else if(sType == Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP)
				return oResourceBundle.getText("instrument.type.industryGroup");
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
		queryInstrumentsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentType) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			if(sInstrumentType != undefined && sInstrumentType != null)
				sQueryUrl= sQueryUrl + "?instrumentType=" + sInstrumentType;
			
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
		},
		
		
		/**
		 * Deletes the given instrument using the WebService.
		 */
		deleteInstrumentByWebService : function(oInstrument, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oInstrument.id;
			
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