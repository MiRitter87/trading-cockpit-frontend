sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {		
		/**
		 * Gets the list data of the list with the given ID.
		 */
		getListById : function(iListId, oLists) {
			//Get the selected list from the array of all lists according to the id.
			for(var i = 0; i < oLists.length; i++) {
    			var oTempList = oLists[i];
    			
				if(oTempList.id == iListId) {
					return oTempList;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Calls a WebService operation to create a list.
		 */
		createListByWebService : function(oListModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/list");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oListModel.getJSON();
			
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
		 * Queries the list WebService for all lists.
		 */
		queryListsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/list");
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
		 * Updates changes of the list data using the WebService.
		 */
		saveListByWebService : function(oListModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/list");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oListModel.getJSON();
			
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
		 * Deletes the given list using the WebService.
		 */
		deleteListByWebService : function(oList, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/list");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oList.id;
			
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
		 * Downloads the Instrument data of the List with the most recent prices as Excel file.
		 */
		downloadListAsExcelFile : function(oList, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/list");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/" + oList.id + "/excel";
			var sFileName = "Recent Prices of List " + oList.id + ".xlsx";
			
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