sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PriceAlertController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, PriceAlertController, formatter, JSONModel, MessageToast, MessageBox) {
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
		 * Handles a selection of an icon in the IconTabBar for price alert filtering.
		 */
		onFilterSelect: function (oEvent) {
			var	sKey = oEvent.getParameter("key");
			
			//Values for status query.
			var sNotTriggered = "NOT_TRIGGERED";
			var sNotConfirmed = "NOT_CONFIRMED";
			var sTriggered = "TRIGGERED";
			var sConfirmed = "CONFIRMED";
			var sAll = "ALL";

			if (sKey === "All") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, sAll, sAll);
			} else if (sKey === "Not_Triggered") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, sNotTriggered, sAll);
			} else if (sKey === "Not_Confirmed") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, sTriggered, sNotConfirmed);
			} else if (sKey === "Finished") {
				PriceAlertController.queryPriceAlertsByWebService(this.queryPriceAlertsCallback, this, true, sTriggered, sConfirmed);
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
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("priceAlertOverview.dataLoaded"));			
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
		 * Formatter of the stock exchange text.
		 */
		stockExchangeTextFormatter: function(sStockExchange) {
			return PriceAlertController.getLocalizedStockExchangeText(sStockExchange, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return PriceAlertController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Checks if a price alert has been selected.
		 */
		isPriceAlertSelected : function () {
			if(this.getView().byId("priceAlertTable").getSelectedItem() == null)
				return false;
			else
				return true;
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