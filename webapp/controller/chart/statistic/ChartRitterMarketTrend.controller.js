sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../MainController",
	"../../list/ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, MainController, ListController, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.statistic.ChartRitterMarketTrend", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartRitterMarketTrendRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
			this.resetUIElements();
    	},
    	
    	
    	/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oOptions = new Object();
			var sTitle = oResourceBundle.getText("chartRmt.info.title");
			var sDescription = oResourceBundle.getText("chartRmt.info.description");
			
			oOptions.title = sTitle;
			MessageBox.information(sDescription, oOptions);
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed: function() {
			var sChartUrl = this.getChartUrl();
			var oImage = this.getView().byId("chartImage");
			
			oImage.setSrc(sChartUrl);
		},
		
		
		/**
		 * Handles error during loading of the chart image using the given URL.
		 */
		onChartImageError: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oImage = this.getView().byId("chartImage");
			var sImageSrc = oImage.getProperty("src");
			
			if (sImageSrc === "") {				
				return;		//There was no image to load.
			}
			
			//The backend currently only supports a response with error code 404 and standard error page with response text.
			//The response site would have to be parsed in order to get the message from the backend.
			//Therefore only a generic error message is being displayed at the moment.
			MessageToast.show(oResourceBundle.getText("chartRmt.getChartError"));
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback: function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setData(oReturnData.data);		
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		},
		
		
		/**
		 * Determines the URL of the chart.
		 */
		getChartUrl: function() {
			var oListComboBox = this.getView().byId("listComboBox");
			var sSelectedListId = oListComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/jFreeChart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			
			sChartUrl = sChartUrl + "/ritterMarketTrend";
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sChartUrl = sChartUrl  + "?randomDate=" + new Date().getTime();
			
			if (sSelectedListId !== "") {				
				sChartUrl = sChartUrl + "&listId=" + sSelectedListId;
			}
			
			return sChartUrl;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements: function() {
			var oListComboBox = this.getView().byId("listComboBox");
			var oImage = this.getView().byId("chartImage");
			
			oListComboBox.setSelectedKey("");
			oImage.setSrc(null);
		}
	});
});