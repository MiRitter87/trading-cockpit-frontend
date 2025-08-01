sap.ui.define([
	"../MainController",
	"../Constants",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(MainController, Constants, Filter, FilterOperator) {
	"use strict";
	
	return {
		/**
		 * Initializes the given ComboBox with items for instrument type selection.
		 */
		initializeTypeComboBox: function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.STOCK, "instrument.type.stock");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.ETF, "instrument.type.etf");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.SECTOR, "instrument.type.sector");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, "instrument.type.industryGroup");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, Constants.INSTRUMENT_TYPE.RATIO, "instrument.type.ratio");
		},
		
		
		/**
		 * Gets the instrument data of the instrument with the given ID.
		 */
		getInstrumentById: function(iInstrumentId, oInstruments) {
			//Get the selected instrument from the array of all instruments according to the id.
			for (var i = 0; i < oInstruments.length; i++) {
    			var oTempInstrument = oInstruments[i];
    			
				if (oTempInstrument.id === iInstrumentId) {
					return oTempInstrument;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns the localized text of the given type.
		 */
		getLocalizedTypeText: function(sType, oResourceBundle) {
			if (sType === Constants.INSTRUMENT_TYPE.STOCK) {				
				return oResourceBundle.getText("instrument.type.stock");
			} else if (sType === Constants.INSTRUMENT_TYPE.ETF) {				
				return oResourceBundle.getText("instrument.type.etf");
			} else if (sType === Constants.INSTRUMENT_TYPE.SECTOR) {				
				return oResourceBundle.getText("instrument.type.sector");
			} else if (sType === Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP) {				
				return oResourceBundle.getText("instrument.type.industryGroup");
			} else if (sType === Constants.INSTRUMENT_TYPE.RATIO) {				
				return oResourceBundle.getText("instrument.type.ratio");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Enables or disables the ComboBoxes for Sector and Industry Group selection.
		 * Also resets the previously selected items if the enabled status is set to false.
		 */
		setSectorAndIgComboBoxEnabled: function(bEnabled, oSectorComboBox, oIndustryGroupComboBox) {
			oSectorComboBox.setEnabled(bEnabled);
			oIndustryGroupComboBox.setEnabled(bEnabled);
			
			if (bEnabled === false) {
				oSectorComboBox.setSelectedItem(null);
				oIndustryGroupComboBox.setSelectedItem(null);
			}
		},
		
		
		/**
		 * Enables or disables the ComboBoxes for ratio selection.
		 * Also resets the previously selected items if the enabled status is set to false.
		 */
		setRatioComboBoxesEnabled: function(bEnabled, oDividendComboBox, oDivisorComboBox) {
			oDividendComboBox.setEnabled(bEnabled);
			oDivisorComboBox.setEnabled(bEnabled);
			
			if (bEnabled === false) {
				oDividendComboBox.setSelectedItem(null);
				oDivisorComboBox.setSelectedItem(null);
			}
		},
		
		
		/**
		 * Sets a filter for the items displayed in the dividend and divisor ComboBoxes.
		 */
		setFilterDividendDivisor: function(oDividendComboBox, oDivisorComboBox) {
			var oBindingDividend = oDividendComboBox.getBinding("items");
			var oBindingDivisor = oDivisorComboBox.getBinding("items");
			var oFilterTypeEtf = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.ETF);
			var oFilterTypeSector = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.SECTOR);
			var oFilterTypeIg = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterTypeEtf, oFilterTypeSector, oFilterTypeIg],
    			and: false
  			});
			
			oBindingDividend.filter([oFilterTotal]);
			oBindingDivisor.filter([oFilterTotal]);
		},
		
		
		/**
		 * Sets a filter for the items displayed in the sector and industry group ComboBoxes.
		 */
		setFilterSectorIg: function(oSectorComboBox, oIndustryGroupComboBox) {
			var oBindingSector = oSectorComboBox.getBinding("items");
			var oBindingIg = oIndustryGroupComboBox.getBinding("items");
			var oFilterTypeSector = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.SECTOR);
			var oFilterTypeIg = new Filter("type", FilterOperator.EQ, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP);
			
			oBindingSector.filter(oFilterTypeSector);
			oBindingIg.filter(oFilterTypeIg);
		},
		
		
		/**
		 * Formatter of the protocol category text.
		 */
		categoryTextFormatter: function(sCategory, oResourceBundle) {
			if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION) {				
				return oResourceBundle.getText("protocol.category.confirmation");
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION) {				
				return oResourceBundle.getText("protocol.category.violation");
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN) {				
				return oResourceBundle.getText("protocol.category.uncertain");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Formatter of the protocol category icon.
		 */
		categoryIconFormatter: function(sCategory) {
			if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION) {				
				return "sap-icon://sys-enter-2";
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION) {				
				return "sap-icon://error";
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN) {				
				return "sap-icon://alert"
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Formatter of the protocol category state.
		 */
		categoryStateFormatter: function(sCategory) {
			if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.CONFIRMATION) {				
				return "Success";
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.VIOLATION) {				
				return "Error";
			} else if (sCategory === Constants.PROTOCOL_ENTRY_CATEGORY.UNCERTAIN) {				
				return "Warning"
			} else {				
				return "None";
			}
		},
		
		
		/**
		 * Formatter of the health check profile text.
		 */
		profileTextFormatter: function(sProfile, oResourceBundle) {
			if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS) {				
				return oResourceBundle.getText("protocol.profile.confirmations");
			} else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_WEAKNESS) {				
				return oResourceBundle.getText("protocol.profile.weakness");
			} else if (sProfile === Constants.HEALTH_CHECK_PROFILE.SELLING_INTO_STRENGTH) {				
				return oResourceBundle.getText("protocol.profile.strength");
			} else if (sProfile === Constants.HEALTH_CHECK_PROFILE.CONFIRMATIONS_WITHOUT_COUNTING) {				
				return oResourceBundle.getText("protocol.profile.confirmationsWithoutCounting");
			} else if (sProfile === Constants.HEALTH_CHECK_PROFILE.WEAKNESS_WITHOUT_COUNTING) {				
				return oResourceBundle.getText("protocol.profile.weaknessWithoutCounting");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Calls a WebService operation to create an instrument.
		 */
		createInstrumentByWebService: function(oInstrumentModel, callbackFunction, oCallingController) {
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
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the instrument WebService for all instruments.
		 */
		queryInstrumentsByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, sInstrumentType) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			if (sInstrumentType !== undefined && sInstrumentType !== null) {				
				sQueryUrl= sQueryUrl + "?instrumentType=" + sInstrumentType;
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
		 * Updates changes of the instrument data using the WebService.
		 */
		saveInstrumentByWebService: function(oInstrumentModel, callbackFunction, oCallingController) {
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
				success: function(data) {
					callbackFunction(data, oCallingController);
				}
			}); 
		},
		
		
		/**
		 * Deletes the given instrument using the WebService.
		 */
		deleteInstrumentByWebService: function(oInstrument, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oInstrument.id;
			
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
		 * Queries the instrument WebService to perform a health check of the given instrument and get the protocol.
		 * The health check begins at the given start date up until the most recent date.
		 */
		checkHealthWithStartDateByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, iInstrumentId, sDate, sProfile) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			sQueryUrl = sQueryUrl + "/" + iInstrumentId + "/health/startDate?startDate=" + sDate +"&profile=" + sProfile;
			
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
		 * Queries the instrument WebService to perform a health check of the given instrument and get the protocol.
		 * The lookback period defines the number of recent days for which the health check is performed.
		 */
		checkHealthWithLookbackPeriodByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, 
			sInstrumentId, sLookbackPeriod, sProfile) {
				
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/instrument");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			sQueryUrl = sQueryUrl + "/" + sInstrumentId + "/health/lookbackPeriod?lookbackPeriod=" + sLookbackPeriod +"&profile=" + sProfile;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success: function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		}
	};
});