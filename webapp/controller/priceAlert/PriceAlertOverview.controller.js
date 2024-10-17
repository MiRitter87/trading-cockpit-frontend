sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./PriceAlertController",
	"../Constants",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MainController, PriceAlertController, Constants, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.priceAlert.PriceAlertOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("priceAlertOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true);
			
			//"Show all price alerts" is always selected when the user navigates to the overview.
			this.getView().byId("filterIconTabBar").setSelectedKey("All");
    	},
    	
    	
    	/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedPriceAlertModel;
			
			if(this.isPriceAlertSelected() == false) {
				MessageBox.error(oResourceBundle.getText("priceAlertOverview.noPriceAlertSelected"));
				return;
			}
			
			oSelectedPriceAlertModel = new JSONModel();
			oSelectedPriceAlertModel.setData(this.getSelectedPriceAlert());
			this.getView().setModel(oSelectedPriceAlertModel, "selectedPriceAlert");
			
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.priceAlert.PriceAlertOverviewDetails");
		},


		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isPriceAlertSelected() == false) {
				MessageBox.error(oResourceBundle.getText("priceAlertOverview.noPriceAlertSelected"));
				return;
			}
			
			PriceAlertController.deletePriceAlertByWebService(this.getSelectedPriceAlert(), this.deletePriceAlertCallback, this);
		},
		
		
		/**
		 * Handles a click at the close button of the price alert details fragment.
		 */
		onCloseDialog : function () {
			this.byId("priceAlertDetailsDialog").close();
		},
		
		
		/**
		 * Handles a selection of an icon in the IconTabBar for price alert filtering.
		 */
		onFilterSelect: function (oEvent) {
			var	sKey = oEvent.getParameter("key");

			if (sKey === "All") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, 
					Constants.ALERT_TRIGGER_STATUS.ALL, Constants.ALERT_CONFIRMATION_STATUS.ALL);
			} else if (sKey === "Not_Triggered") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, 
					Constants.ALERT_TRIGGER_STATUS.NOT_TRIGGERED, Constants.ALERT_CONFIRMATION_STATUS.ALL);
			} else if (sKey === "Not_Confirmed") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, 
				Constants.ALERT_TRIGGER_STATUS.TRIGGERED, Constants.ALERT_CONFIRMATION_STATUS.NOT_CONFIRMED);
			} else if (sKey === "Finished") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, 
					Constants.ALERT_TRIGGER_STATUS.TRIGGERED, Constants.ALERT_CONFIRMATION_STATUS.CONFIRMED);
			}
		},


		/**
		 * Callback function of the queryPriceAlert RESTful WebService call in the PriceAlertController.
		 */
		queryPriceAlertsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true) {					
					MessageToast.show(oResourceBundle.getText("priceAlertOverview.dataLoaded"));			
				}
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "priceAlerts");
		},
		
		
		/**
		 * Callback function of the deletePriceAlert RESTful WebService call in the PriceAlertController.
		 */
		deletePriceAlertCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					PriceAlertController.queryPriceAlertsByWebService(oCallingController.queryPriceAlertsCallback, oCallingController, false);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return PriceAlertController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the price and currency display text.
		 */
		priceCurrencyTextFormatter: function(sPrice, sCurrencyCode) {
			var sPriceCurrencyString = "";
			var sFormattedCurrency = PriceAlertController.getCurrencyDisplayText(sCurrencyCode);
			
			sPriceCurrencyString = sPrice + " " + sFormattedCurrency;
			
			return sPriceCurrencyString;
		},
		
		
		/**
		 * Checks if a price alert has been selected.
		 */
		isPriceAlertSelected : function () {
			if(this.getView().byId("priceAlertTable").getSelectedItem() == null) {				
				return false;
			} else {				
				return true;
			}
		},
		
		
		/**
		 * Gets the the selected price alert.
		 */
		getSelectedPriceAlert : function () {
			var oListItem = this.getView().byId("priceAlertTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("priceAlerts");
			var oSelectedPriceAlert = oContext.getProperty(null, oContext);
			
			return oSelectedPriceAlert;
		}
	});
});