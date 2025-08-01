sap.ui.define([
	"../MainController"
], function(MainController) {
	"use strict";
	return {
		/**
		 * Queries the statistic WebService for all statistics.
		 */
		queryStatisticsByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, sType, sSectorId, sIndustryGroupId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/statistic");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "?instrumentType=" + sType;
			
			if (sSectorId !== undefined) {
				sQueryUrl = sQueryUrl + "&sectorId=" + sSectorId;
			}
			
			if (sIndustryGroupId !== undefined) {
				sQueryUrl = sQueryUrl + "&industryGroupId=" + sIndustryGroupId;
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
		 * Queries the Dashboard WebService for the health status of the given market.
		 */
		queryMarketHealthStatusByWebService: function(callbackFunction, oCallingController, bShowSuccessMessage, iInstrumentId, sListId) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/dashboard");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/marketHealthStatus/" + iInstrumentId;
			
			if (sListId !== "") {
				sQueryUrl = sQueryUrl + "?listId=" + sListId;
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
		}
	};
});