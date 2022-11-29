sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Queries the statistic WebService for all statistics.
		 */
		queryStatisticsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/statistic");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "?instrumentType=STOCK";
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		}
	};
});