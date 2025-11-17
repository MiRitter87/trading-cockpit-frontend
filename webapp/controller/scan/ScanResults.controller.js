sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../MainController",
	"../Constants",
	"./ScanController",
	"./ScanResultsHelper",
	"../instrument/InstrumentController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/SortController",
	"sap/ui/model/Sorter",
	"sap/m/ColumnListItem",
	"sap/ui/core/library",
	"sap/ui/core/Fragment"
], function(Controller, MainController, Constants, ScanController, ScanResultsHelper, InstrumentController, JSONModel,
	MessageToast, MessageBox, Filter, FilterOperator, Engine, SelectionController, SortController, Sorter,
	ColumnListItem, coreLibrary, Fragment) {
		
	"use strict";
	
	return Controller.extend("trading-cockpit-frontend.controller.scan.ScanResults", {
		/**
		 * Initializes the controller.
		 */
		onInit: function() {
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("scanResultsRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeTemplateComboBox();
			this.initializeSettingsDialog();
			
			InstrumentController.initializeTypeComboBox(oTypeComboBox, this.getOwnerComponent().getModel("i18n").getResourceBundle());
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
		},
		
		
		/**
		 * Handles destroying of the ScanResults view.
		 */
		onExit: function() {
			this._oTPC.destroy();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function() {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, 
				Constants.SCAN_TEMPLATE.ALL, Constants.INSTRUMENT_TYPE.STOCK);
			
			this.resetUiElements();
    	},
    	
    	
    	/**
		 * Handles the selection of a scan template.
		 */
		onTemplateSelectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oStartDateLabel = this.getView().byId("startDateLabel");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			
			//Handle visibility of date label and picker.
			if (oSelectedItem === null) {
				oStartDateLabel.setVisible(false);
				oStartDatePicker.setVisible(false);
				return;
			}
			else if (oSelectedItem.getKey() === Constants.SCAN_TEMPLATE.RS_SINCE_DATE) {
				oStartDateLabel.setVisible(true);
				oStartDatePicker.setVisible(true);
			}
			else {
				oStartDateLabel.setVisible(false);
				oStartDatePicker.setVisible(false);
			}
			
			//Handle visibility of instrument types.
			if (oSelectedItem.getKey() === Constants.SCAN_TEMPLATE.RS_NEAR_HIGH_IG) {
				ScanResultsHelper.enableInstrumentTypesInComboBox(oTypeComboBox, [Constants.INSTRUMENT_TYPE.STOCK]);
				
				if (oTypeComboBox.getSelectedKey() !== Constants.INSTRUMENT_TYPE.STOCK) {				
					oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
				}
			}
			else {
				ScanResultsHelper.enableInstrumentTypesInComboBox(oTypeComboBox, [Constants.INSTRUMENT_TYPE.STOCK,
					Constants.INSTRUMENT_TYPE.ETF, Constants.INSTRUMENT_TYPE.SECTOR,
					Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.RATIO]);
			}
		},
    	
    	
    	/**
    	 * Handles the button press event of the refresh scan results button.
    	 */
    	onRefreshPressed: function() {
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oLiquidityInput = this.getView().byId("liquidityInput");
			var oAtrpInput = this.getView().byId("atrpInput");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			var sSelectedTemplate = oTemplateComboBox.getSelectedKey();
			var sSelectedType = oTypeComboBox.getSelectedKey();
			var sSelectedDate = oStartDatePicker.getValue();
			var sMinLiquidity = oLiquidityInput.getValue();
			var sMinAtrp = oAtrpInput.getValue();
			
			
			if (sSelectedTemplate === "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noTemplateSelected"));
				return;
			}
			
			if (sSelectedType === "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noTypeSelected"));
				return;				
			}
				
			if (sSelectedTemplate === Constants.SCAN_TEMPLATE.RS_SINCE_DATE && sSelectedDate === "") {
				MessageBox.information(oResourceBundle.getText("scanResults.noDateSelected"));
				return;				
			}
			
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, true, 
				sSelectedTemplate, sSelectedType, sSelectedDate, sMinLiquidity, sMinAtrp);
		},
		
		
		/**
    	 * Handles the button press event of the template information button.
    	 */
    	onTemplateInformationPressed: function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sKey = oComboBox.getSelectedKey();
			
			ScanResultsHelper.openTemplateInformation(oResourceBundle, sKey);
		},
		
		
		/**
		 * Handles the link pressed event of the symbol link.
		 */
		onSymbolLinkPressed: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var	oControl = oEvent.getSource();
			var	oView = this.getView();

			//Open Popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "trading-cockpit-frontend.view.scan.MiniChartPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			this._pPopover.then(function(oPopover) {
				oPopover.bindElement(oContext.getPath());
				oPopover.openBy(oControl);
			});
		},
		
		
		/**
		 * Handles loading of image after the mini chart Popover has been opened.
		 */
		afterMiniChartPopoverOpened: function(oControlEvent) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/jFreeChart");
			var sChartUrl = sServerAddress + sWebServiceBaseUrl;
			var oPopover = oControlEvent.getSource();
			var oContext = oPopover.getBindingContext();
			var oQuotationData = oContext.getObject();
			var oMiniChartImage = this.getView().byId("miniChartImage");
			
			sChartUrl = sChartUrl + "/priceVolume/mini/" + oQuotationData.instrument.id;
			
			oMiniChartImage.setSrc(sChartUrl);
		},
		
		
		/**
    	 * Handles the button pressed event of the "StockCharts" button in the table header.
    	 */
    	onStockchartsPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if (this.isInstrumentSelected() === false) {
				MessageBox.error(oResourceBundle.getText("scanResults.noInstrumentSelected"));
				return;
			}
			
			this.openStockChart(this.getSelectedInstrument());
		},
		
		
		/**
    	 * Handles the button pressed event of the "Earnings" button in the table header.
    	 */
    	onEarningsPressed: function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrument;
			
			if (this.isInstrumentSelected() === false) {
				MessageBox.error(oResourceBundle.getText("scanResults.noInstrumentSelected"));
				return;
			}
			
			oInstrument = this.getSelectedInstrument();
			
			if (oInstrument.type !== Constants.INSTRUMENT_TYPE.STOCK) {
				MessageBox.error(oResourceBundle.getText("scanResults.wrongTypeForEarnings"));
				return;
			}
			
			this.openEarnings(oInstrument);
		},
		
		
		/**
		 * Handles the search function of the scan results table.
		 */
		onSearch: function(oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oBinding = this.getView().byId("quotationTable").getBinding("items");
			
			var oFilterSymbol = new Filter("instrument/symbol", FilterOperator.Contains, sValue);
			var oFilterName = new Filter("instrument/name", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSymbol, oFilterName],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the search function in the SelectDialog for Instrument comparison.
		 */
		onCompareSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getParameter("itemsBinding");
			
			var oFilterSymbol = new Filter("instrument/symbol", FilterOperator.Contains, sValue);
			var oFilterName = new Filter("instrument/name", FilterOperator.Contains, sValue);
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: [oFilterSymbol, oFilterName],
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		},
		
		
		/**
		 * Handles the closing of the SelectDialog for Instrument comparison.
		 */
		onCompareDialogClose: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oBinding = this.getView().byId("quotationTable").getBinding("items");
			var aFilterArray = new Array();
			var oSingleFilter, oTotalFilter;
			
			if (aContexts && aContexts.length) {
				for (var iIndex = 0; iIndex < aContexts.length; iIndex++) {
					var oContext = aContexts[iIndex];
					
					//Single results are compared by their Quotation ID.
					oSingleFilter = new Filter("id", FilterOperator.EQ, oContext.getObject().id);
					aFilterArray.push(oSingleFilter);
				}
				
				//Connect multiple filters of single results via logical "OR".
				var oTotalFilter = new Filter({
					filters: aFilterArray,
	    			and: false
	  			});
			}
			
			if (aFilterArray.length > 0) {				
				oBinding.filter([oTotalFilter]);
			} else {				
				oBinding.filter([]);
			}	
		},
		
		
		/**
		 * Handles the button pressed event of the compare instruments button.
		 */
		onComparePressed: function() {
			MainController.openFragmentAsPopUp(this, "trading-cockpit-frontend.view.scan.InstrumentSelectionDialog");
		},
		
		
		/**
		 * Handles the button pressed event of the settings button.
		 */
		onSettingsPressed: function(oEvent) {
			var oTable = this.byId("quotationTable");

			Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvent.getSource()
			});
		},
		
		
		/**
		 * Handles state changes of the personalization dialog.
		 */
		handleStateChange: function(oEvent) {
			var oTable = this.byId("quotationTable");
			var oState = oEvent.getParameter("state");
			var aSorter = [];
			var aCells;
			
			if (!oState) {
				return;
			}
			
			oState.Sorter.forEach(function(oSorter) {
				var oExistingSorter = aSorter.find(function(oSort){
					return oSort.sPath === this.oMetadataHelper.getProperty(oSorter.key).path;
				}.bind(this));

				if (oExistingSorter) {
					oExistingSorter.bDescending = !!oSorter.descending;
				} else {
					aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
				}
			}.bind(this));
			
			oTable.getColumns().forEach(function(oColumn){
       			oColumn.setVisible(false);
       			oColumn.setSortIndicator(coreLibrary.SortOrder.None);
    		});
    		
    		oState.Sorter.forEach(function(oSorter) {
				var oCol = this.byId(oSorter.key);
				if (oSorter.sorted !== false) {
					oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
				}
			}.bind(this));
    		    		
    		oState.Columns.forEach(function(oProp, iIndex){
        		var oCol = this.byId(oProp.key);
        		oCol.setVisible(true);

        		oTable.removeColumn(oCol);
        		oTable.insertColumn(oCol, iIndex);
    		}.bind(this));
    		
    		aCells = ScanResultsHelper.getTableCells(oState, this);
    		
    		oTable.bindItems({
        		templateShareable: false,
        		path: '/quotation/',
        		sorter: aSorter,
        		template: new ColumnListItem({cells: aCells})
    		});
		},
		
    	
    	/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback: function(oReturnData, oCallingController) {
			var oSearchField = oCallingController.getView().byId("resultsSearchField");
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.message !== null && oReturnData.message.length > 0) {
				if (oReturnData.message[0].type === 'S') {
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if (oReturnData.message[0].type === 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
			
			//Do not use a named model because the sorting dialog is not compatible with named models.
			oCallingController.getView().setModel(oModel);
			
			oSearchField.setValue("");
		},
		
		
		/**
		 * Initializes the ComboBox for Scan template selection.
		 */
		initializeTemplateComboBox: function() {
			var oComboBox = this.getView().byId("templateComboBox");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			ScanResultsHelper.initializeTemplateComboBox(oResourceBundle, oComboBox);
		},
		
		
		/**
		 * Initializes the dialog for settings (Personalization).
		 */
		initializeSettingsDialog: function() {
			var oTable = this.byId("quotationTable");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			this.oMetadataHelper = ScanResultsHelper.getMetadataHelper(oResourceBundle);
			
			Engine.getInstance().register(oTable, {
				helper: this.oMetadataHelper,
				controller: {
					Columns: new SelectionController({
						targetAggregation: "columns",
						control: oTable
					}),
        			Sorter: new SortController({
            			control: oTable
        			})
				}
			});
			
			Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
		},
		
		
		/**
		 * Opens the stock chart of the given Instrument.
		 */
		openStockChart: function(oInstrument) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/jFreeChart");
			var sChartUrl = ScanResultsHelper.getChartUrl(oInstrument, sWebServiceBaseUrl);
					
			window.open(sChartUrl, '_blank');
		},
		
		
		/**
		 * Opens a website with earnings data of the given Instrument.
		 */
		openEarnings: function(oInstrument) {
			var sEarningsUrl = ScanResultsHelper.getEarningsUrl(oInstrument);
					
			window.open(sEarningsUrl, '_blank');
		},
		
		
		/**
		 * Resets the UI elements into the intial state.
		 */
		resetUiElements: function() {
			var oTemplateComboBox = this.getView().byId("templateComboBox");
			var oTypeComboBox = this.getView().byId("typeComboBox");
			var oStartDateLabel = this.getView().byId("startDateLabel");
			var oStartDatePicker = this.getView().byId("startDatePicker");
			var oLiquidityInput = this.getView().byId("liquidityInput");
			var oAtrpInput = this.getView().byId("atrpInput");
			var oSearchField = this.getView().byId("resultsSearchField");
			
			ScanResultsHelper.enableInstrumentTypesInComboBox(oTypeComboBox, [Constants.INSTRUMENT_TYPE.STOCK,
					Constants.INSTRUMENT_TYPE.ETF, Constants.INSTRUMENT_TYPE.SECTOR,
					Constants.INSTRUMENT_TYPE.INDUSTRY_GROUP, Constants.INSTRUMENT_TYPE.RATIO]);
						
			oTemplateComboBox.setSelectedKey(Constants.SCAN_TEMPLATE.ALL);
			oTypeComboBox.setSelectedKey(Constants.INSTRUMENT_TYPE.STOCK);
			
			oStartDateLabel.setVisible(false);
			oStartDatePicker.setVisible(false);
			
			oLiquidityInput.setValue("");
			oAtrpInput.setValue("");
			
			oSearchField.setValue("");
		},
		
		
		/**
		 * Formatter of the type text.
		 */
		typeTextFormatter: function(sType) {
			return InstrumentController.getLocalizedTypeText(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * State formatter of the (Composite) RS-Number ObjectStatus.
		 */
		rsNumberStateFormatter: function(iRsNumber) {
			if (iRsNumber >= 80) {
				return "Success";
			} else if (iRsNumber <= 20) {
				return "Error";
			} else  {
				return "None";
			}
		},
		
		
		/**
		 * State formatter of the Up/Down volume ratio ObjectStatus.
		 */
		udVolRatioStateFormatter: function(iUdVolRatio) {
			if (iUdVolRatio >= 1.2) {
				return "Success";
			} else if (iUdVolRatio <= 0.8) {
				return "Error";
			} else  {
				return "None";
			}
		},
		
		
		/**
		 * State formatter of the distance to the 52w high.
		 */
		distance52wHighStateFormatter: function(fDistanceTo52wHigh) {
			if (fDistanceTo52wHigh >= -5) {
				return "Success";
			}
		},
		
		
		/**
		 * Checks if an instrument has been selected.
		 */
		isInstrumentSelected: function() {
			if (this.getView().byId("quotationTable").getSelectedItem() === null) {				
				return false;
			} else {				
				return true;
			}
		},
		
		
		/**
		 * Gets the the selected instrument.
		 */
		getSelectedInstrument: function() {
			var oListItem = this.getView().byId("quotationTable").getSelectedItem();
			var oContext = oListItem.getBindingContext();
			var oSelectedQuotation = oContext.getProperty(null, oContext);
			
			return oSelectedQuotation.instrument;
		},
	});
});