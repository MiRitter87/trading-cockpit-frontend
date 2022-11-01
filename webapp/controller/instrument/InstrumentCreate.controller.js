sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"./InstrumentController",
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MainController, InstrumentController, Constants, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.instrument.InstrumentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter.getRoute("instrumentCreateRoute").attachMatched(this._onRouteMatched, this);
			
			MainController.initializeStockExchangeComboBox(this.getView().byId("stockExchangeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
				
			InstrumentController.initializeTypeComboBox(this.getView().byId("typeComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.resetUIElements();
			this.initializeInstrumentModel();
			
			//Query instruments for potential selection of sector and industry group.
			InstrumentController.queryInstrumentsByWebService(this.querySectorsCallback, this, false, Constants.INSTRUMENT_TYPE.SECTOR);
			InstrumentController.queryInstrumentsByWebService(this.queryIndustryGroupsCallback, this, false, Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP);
    	},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("stockExchangeComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedStockExchange();
				return;
			}
			
			if(this.getView().byId("typeComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedType();
				return;
			}
			
			InstrumentController.createInstrumentByWebService(this.getView().getModel("newInstrument"), this.createInstrumentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this));	
		},
		
		
		/**
		 * Handles the selection of an instrument type.
		 */
		onTypeSelectionChange : function () {
			var oInstrumentModel;
			var sSelectedType;
			
			oInstrumentModel = this.getView().getModel("newInstrument");
			sSelectedType = oInstrumentModel.getProperty("/type");
			
			if(sSelectedType == Constants.INSTRUMENT_TYPE.STOCK)
				this.setSectorAndIgComboBoxEnabled(true);
			else
				this.setSectorAndIgComboBoxEnabled(false);
		},
		
		
		/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		querySectorsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "sectors");
		},
		
		
		/**
		 * Callback function of the queryInstrumentsByWebService RESTful WebService call in the InstrumentController.
		 */
		queryIndustryGroupsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "industryGroups");
		},
		
		
		/**
		 * Callback function of the createInstrument RESTful WebService call in the InstrumentController.
		 */
		createInstrumentCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					//"this" is unknown in the success function of the ajax call. Therefore the calling controller is provided.
					oCallingController.resetUIElements();
					oCallingController.initializeInstrumentModel();
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
		 * Initializes the instrument model to which the UI controls are bound.
		 */
		initializeInstrumentModel : function () {
			var oInstrumentModel = new JSONModel();
			
			oInstrumentModel.loadData("model/instrument/instrumentCreate.json");
			this.getView().setModel(oInstrumentModel, "newInstrument");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("stockExchangeComboBox").setSelectedItem(null);
			this.getView().byId("typeComboBox").setSelectedItem(null);
			
			this.setSectorAndIgComboBoxEnabled(false);
		},
		
		
		/**
		 * Displays a message in case the stock exchange has not been selected.
		 */
		showMessageOnUndefinedStockExchange : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("instrumentCreate.noStockExchangeSelected"));
		},
		
		
		/**
		 * Displays a message in case the type has not been selected.
		 */
		showMessageOnUndefinedType : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("instrumentCreate.noTypeSelected"));
		},
		
		
		/**
		 * Enables or disables the ComboBoxes for Sector and Industry Group selection.
		 */
		setSectorAndIgComboBoxEnabled : function (bEnabled) {
			var oComboBox;
			
			oComboBox = this.getView().byId("sectorComboBox");
			oComboBox.setEnabled(bEnabled);
			
			oComboBox = this.getView().byId("industryGroupComboBox");
			oComboBox.setEnabled(bEnabled);
		}
	});
});