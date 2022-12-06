sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"../list/ListController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MainController, Constants, ListController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.dashboard.DashboardCharts", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("dashboardChartsRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTypeComboBox();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ListController.queryListsByWebService(this.queryListsCallback, this, false);
    	},
		
		
		/**
		 * Handles the selection of a chart type.
		 */
		onTypeSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oListLabel = this.getView().byId("listLabel");
			var oListComboBox = this.getView().byId("listComboBox");
			
			if(oSelectedItem == null) {
				oListLabel.setVisible(false);
				oListComboBox.setVisible(false);
			}
			else if(oSelectedItem.getKey() == Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER) {
				oListLabel.setVisible(true);
				oListComboBox.setVisible(true);
			}
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var oImage = this.getView().byId("chartImage");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var sSelectedType = oTypeComboBox.getSelectedKey();
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/statistic");
			var sQueryUrl;
			
			//The randomDate parameter is not evaluated by the backend. 
			//It assures that the image is not loaded from the browser cache by generating a new query URL each time.
			sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/chart?chartType=" + sSelectedType + "&randomDate=" + new Date().getTime();
			
			if(sSelectedType != "")
				oImage.setSrc(sQueryUrl);
			else
				oImage.setSrc(null);
		},
		
		
		/**
		 * Initializes the ComboBox of chart type.
		 */
		initializeTypeComboBox : function () {
			var oComboBox = this.getView().byId("typeComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			MainController.addItemToComboBox(oComboBox, oResourceBundle, 
				Constants.CHART_TYPE.ADVANCE_DECLINE_NUMBER, "dashboardCharts.type.advanceDeclineNumber");
		},
		
		
		/**
		 * Callback function of the queryLists RESTful WebService call in the ListController.
		 */
		queryListsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);		
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "lists");
		}
	});
});