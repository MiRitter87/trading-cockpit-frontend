sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Gets the scan data of the scan with the given ID.
		 */
		getScanById : function(iScanId, oScans) {
			//Get the selected scan from the array of all scans according to the id.
			for(var i = 0; i < oScans.length; i++) {
    			var oTempScan = oScans[i];
    			
				if(oTempScan.id == iScanId) {
					return oTempScan;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns the localized text of the given status.
		 */
		getLocalizedStatusText : function(sStatus, oResourceBundle) {
			if(sStatus == "IN_PROGRESS")
				return oResourceBundle.getText("scan.status.inProgress");
			else if(sStatus == "FINISHED")
				return oResourceBundle.getText("scan.status.finished");
			else
				return "";
		},
		
				
		/**
		 * Calls a WebService operation to create a scan.
		 */
		createScanByWebService : function(oScanModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/scan");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oScanModel.getJSON();
			
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
		 * Queries the scan WebService for all scans.
		 */
		queryScansByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/scan");
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
		}
	};
});