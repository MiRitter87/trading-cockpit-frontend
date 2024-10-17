sap.ui.define([
	"../MainController",
	"../Constants",
	"sap/ui/model/json/JSONModel"
], function (MainController, Constants, JSONModel) {
	"use strict";
	return {
		/**
		 * Gets the scan data of the scan with the given ID.
		 */
		getScanById : function(iScanId, oScans) {
			//Get the selected scan from the array of all scans according to the id.
			for (var i = 0; i < oScans.length; i++) {
    			var oTempScan = oScans[i];
    			
				if (oTempScan.id === iScanId) {
					return oTempScan;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Gets the instrument data of the instrument with the given ID.
		 */
		getInstrumentById : function(iInstrumentId, oQuotations) {
			//Get the selected instrument from the array of all quotations according to the id.
			for (var i = 0; i < oQuotations.length; i++) {
    			var oTempQuotation = oQuotations[i];
    			
				if (oTempQuotation.instrument.id === iInstrumentId) {
					return oTempQuotation.instrument;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Creates a representation of a scan that can be processed by the WebService.
		 */
		getScanForWebService : function(oScan) {
			var wsScan = new JSONModel();
			
			//Data at head level
			wsScan.setProperty("/id", oScan.id);
			wsScan.setProperty("/name", oScan.name);
			wsScan.setProperty("/description", oScan.description);
			wsScan.setProperty("/lastScan", oScan.lastScan);
			wsScan.setProperty("/executionStatus", oScan.executionStatus);
			wsScan.setProperty("/completionStatus", oScan.completionStatus);
			wsScan.setProperty("/progress", oScan.progress);
			
			//Data at item level
			wsScan.setProperty("/listIds", new Array());
			
			for (var i = 0; i < oScan.lists.length; i++) {
				var oList = oScan.lists[i];
				
				wsScan.oData.listIds.push(oList.id);
			}
			
			wsScan.setProperty("/incompleteInstrumentIds", new Array());
			
			for (var i = 0; i < oScan.incompleteInstruments.length; i++) {
				var oInstrument = oScan.incompleteInstruments[i];
				
				wsScan.oData.incompleteInstrumentIds.push(oInstrument.id);
			}
			
			return wsScan;
		},
		
		
		/**
		 * Returns the localized text of the given execution status.
		 */
		getLocalizedExecutionStatusText : function(sStatus, oResourceBundle) {
			if (sStatus === Constants.SCAN_EXECUTION_STATUS.NOT_EXECUTED) {				
				return oResourceBundle.getText("scan.executionStatus.notExecuted");
			} else if (sStatus === Constants.SCAN_EXECUTION_STATUS.IN_PROGRESS) {				
				return oResourceBundle.getText("scan.executionStatus.inProgress");
			} else if (sStatus === Constants.SCAN_EXECUTION_STATUS.FINISHED) {				
				return oResourceBundle.getText("scan.executionStatus.finished");
			} else {				
				return "";
			}
		},
		
		
		/**
		 * Returns the localized text of the given completion status.
		 */
		getLocalizedCompletionStatusText : function(sStatus, oResourceBundle) {
			if (sStatus === Constants.SCAN_COMPLETION_STATUS.COMPLETE) {				
				return oResourceBundle.getText("scan.completionStatus.complete");
			} else if (sStatus === Constants.SCAN_COMPLETION_STATUS.INCOMPLETE) {				
				return oResourceBundle.getText("scan.completionStatus.incomplete");
			} else {				
				return "";
			}
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
		},
		
		
		/**
		 * Updates changes of the scan data using the WebService.
		 */
		saveScanByWebService : function(oScanModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/scan");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oScanModel.getJSON();
			
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
		 * Deletes the given scan using the WebService.
		 */
		deleteScanByWebService : function(oScan, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/scan");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oScan.id;
			
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
		},
		
		
		/**
		 * Queries the quotation WebService for quotations.
		 */
		queryQuotationsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sTemplate, sType, 
			sStartDate, sMinLiquidity, sMinAtrp) {
				
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/quotation");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl;
			
			//Add template to URL.
			if (sTemplate === Constants.SCAN_TEMPLATE.RS_SINCE_DATE) {				
				sQueryUrl = sQueryUrl + "?scanTemplate=" + Constants.SCAN_TEMPLATE.RS_SINCE_DATE + "&startDate=" + sStartDate;
			} else {				
				sQueryUrl = sQueryUrl + "?scanTemplate=" + sTemplate;
			}
			
			//Add instrument type to URL.
			if (sType !== undefined && sType !== "") {				
				sQueryUrl = sQueryUrl + "&instrumentType=" + sType;
			}
				
			if (sMinLiquidity !== undefined && sMinLiquidity !== "") {				
				sQueryUrl = sQueryUrl + "&minLiquidity=" + sMinLiquidity;
			}
				
			if (sMinAtrp !== undefined && sMinAtrp !== "") {				
				sQueryUrl = sQueryUrl + "&minAtrp=" + sMinAtrp;
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
		}
	};
});