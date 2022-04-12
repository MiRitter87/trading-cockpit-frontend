sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PriceAlertController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertEdit", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query price alert data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			this.getView().setModel(null, "selectedPriceAlert");
			//this.resetUIElements();
    	},


		/**
		 * Callback function of the queryPriceAlerts RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				PriceAlertController.initializeDatesAsObject(oModel.oData.priceAlert);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("priceAlertEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		}
	});
});