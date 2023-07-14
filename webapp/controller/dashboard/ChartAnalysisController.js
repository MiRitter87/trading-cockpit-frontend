sap.ui.define([
	"../MainController",
	"./DashboardController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./lightweight-charts.standalone.production"
], function (MainController, DashboardController, JSONModel, DateFormat, MessageBox, MessageToast) {
	"use strict";
	return {
		/**
		 * Handles initialization of the TradingView lightweight-charts component.
		 */
		openChart : function (oCallingController) {
			var oChartModel = new JSONModel();
			var divId = oCallingController.createId("chartContainer")
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(divId).innerHTML = "";
			
			const chart = LightweightCharts.createChart(document.getElementById(divId), {
  				width: 800,
  				height: 400,
			});
			
			const candlestickSeries = chart.addCandlestickSeries();
			candlestickSeries.setData(this.getCandlestickSeries(oCallingController));
			
			//Automatically zoom the time scale to display all datasets over the full width of the chart.
			chart.timeScale().fitContent();
			
			// Customizing the Crosshair
			chart.applyOptions({
    			crosshair: {
			        // Change mode from default 'magnet' to 'normal'.
			        // Allows the crosshair to move freely without snapping to datapoints
			        mode: LightweightCharts.CrosshairMode.Normal
    			},
			});
			
			//Handle clicks in the chart. The controller needs to be bound to access the data model within the handler.
			chart.subscribeClick(this.onChartClicked.bind(oCallingController));
			
			//The candlestickSeries needs to be stored in the controller for further access later on.
			oChartModel.setProperty("/candlestickSeries", candlestickSeries);
			oCallingController.getView().setModel(oChartModel, "chartModel");
		},
		
		
		/**
		 * Creates a candlestick series that contains the data to be displayed.
		 */
		getCandlestickSeries : function (oCallingController) {
			var oQuotationsModel = oCallingController.getView().getModel("quotations");
			var oQuotations = oQuotationsModel.oData.quotation;
			var aCandlestickSeries = new Array();
			var oDateFormat, oDate, sFormattedDate;
			
			oDateFormat = DateFormat.getDateInstance({pattern : "YYYY-MM-dd"});
			
			//The dataset needs to be constructed beginning at the oldest value.
			for(var i = oQuotations.length -1; i >= 0; i--) {
    			var oQuotation = oQuotations[i];
    			var oCandlestickDataset = new Object();
    			
    			oCandlestickDataset.open = oQuotation.open;
    			oCandlestickDataset.high = oQuotation.high;
    			oCandlestickDataset.low = oQuotation.low;
    			oCandlestickDataset.close = oQuotation.close;
    			
    			oDate = new Date(parseInt(oQuotation.date));
    			sFormattedDate = oDateFormat.format(oDate);
    			oCandlestickDataset.time = sFormattedDate;
    			
    			aCandlestickSeries.push(oCandlestickDataset);
			}
			
			return aCandlestickSeries;
		},
		
		
		/**
		 * Handles clicks in the TradingView chart.
		 */
		onChartClicked : function (param) {
			if (!param.point) {
		        return;
		    }
			
			var oSelectedCoordinateModel = new JSONModel();
		    var oChartModel = this.getView().getModel("chartModel");
		    var candlestickSeries = oChartModel.getProperty("/candlestickSeries");
		    var price = candlestickSeries.coordinateToPrice(param.point.y);
			
			//Write selected price to JSONModel and bind model to view.
			oSelectedCoordinateModel.setProperty("/price", price.toFixed(2));
			oSelectedCoordinateModel.setProperty("/date", param.time);
			this.getView().setModel(oSelectedCoordinateModel, "selectedCoordinates");
		},
		
		
		/**
		 * Handles the button press event of the add object button.
		 */
		onAddObjectPressed : function(oCallingController) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			var sSelectedInstrumentId = oInstrumentComboBox.getSelectedKey();
			
			if(sSelectedInstrumentId == "") {
				MessageBox.information(oResourceBundle.getText("dashboardCharts.noInstrumentSelected"));
				return;				
			}
			
			DashboardController.queryQuotationsByWebService(this.queryQuotationsCallback, oCallingController, false, sSelectedInstrumentId);
		},
		
		
		/**
		 * Handles the button press event of the open chart button for chart object coordinate selection.
		 */
		onOpenChartPressed : function(oCallingController) {
			MainController.openFragmentAsPopUp(oCallingController, "trading-cockpit-frontend.view.dashboard.TradingViewChartContainer", 
				this.onTradingViewPopupOpened.bind(this));
		},
		
		
		/**
		 * Handles the button press event of the save button in the "create chart object" dialog.
		 */
		onSaveNewChartObjectPressed : function (oCallingController) {
			var bInputValid = this.isHorizontalLineInputvalid(oCallingController);
			var oHorizontalLineModel;
			
			if(bInputValid == false)
				return;
				
			oHorizontalLineModel = this.getHorizontalLineModel(oCallingController);
			
			this.createHorizontalLineByWebService(oHorizontalLineModel, this.createHorizontalLineCallback, oCallingController);
		},
		
		
		/**
		 * Handles the button press event of the cancel button in the "create chart object" dialog.
		 */
		onCancelCreateChartObjectDialog : function(oCallingController) {
			var oSelectedCoordinateModel = new JSONModel();
			var oObjectTypeComboBox = oCallingController.getView().byId("objectTypeComboBox");
			
			oObjectTypeComboBox.setSelectedKey("");
			oCallingController.getView().setModel(oSelectedCoordinateModel, "selectedCoordinates");
			oCallingController.byId("createChartObjectDialog").close();
		},
		
		
		/**
		 * Executed after PopUp for TradingView chart has been fully initialized and opened.
		 */
		onTradingViewPopupOpened : function (oCallingController) {
			this.openChart(oCallingController);
		},
		
		
		/**
		 * Handles a click at the take coordinate button of the TradingView chart container.
		 */
		onTakeCoordinate : function (oCallingController) {
			oCallingController.byId("tradingViewChartContainerDialog").close();
		},
		
		
		/**
		 * Handles a click at the cancel button of the TradingView chart container.
		 */
		onCancelChartDialog : function (oCallingController) {
			var oSelectedCoordinateModel = new JSONModel();
			
			oCallingController.getView().setModel(oSelectedCoordinateModel, "selectedCoordinates");
			oCallingController.byId("tradingViewChartContainerDialog").close();
		},
		
		
		/**
		 * Callback function of the queryQuotations RESTful WebService call in the DashboardController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);		
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "quotations");
			
			MainController.openFragmentAsPopUp(oCallingController, "trading-cockpit-frontend.view.dashboard.CreateChartObject");
		},
		
		
		/**
		 * Callback function of the createHorizontalLine RESTful WebService call.
		 */
		createHorizontalLineCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
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
		 * Calls a WebService operation to create a horizontal line object.
		 */
		createHorizontalLineByWebService : function(oHorizontalLineModel, callbackFunction, oCallingController) {
			var sServerAddress = MainController.getServerAddress();
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/horizontalLine");
			var sQueryUrl = sServerAddress + sWebServiceBaseUrl + "/";
			var sJSONData = oHorizontalLineModel.getJSON();
			
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
		 * Checks if the input for the horizontal line is valid.
		 */
		isHorizontalLineInputvalid : function (oCallingController) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var sSelectedObjectType = oCallingController.getView().byId("objectTypeComboBox").getSelectedKey();
			var oSelectedCoordinateModel;
			var price;
			
			if(sSelectedObjectType == "") {
				MessageBox.error(oResourceBundle.getText("dashboardCharts.noObjectTypeSelected"));
				return false;
			}
			
			oSelectedCoordinateModel = oCallingController.getView().getModel("selectedCoordinates");
			
			if(oSelectedCoordinateModel == null || oSelectedCoordinateModel == undefined) {
				MessageBox.error(oResourceBundle.getText("dashboardCharts.noHorizontalPriceSelected"));
				return false;
			} else {
				price = oSelectedCoordinateModel.getProperty("/price")
				
				if(price == undefined || price == "") {
					MessageBox.error(oResourceBundle.getText("dashboardCharts.noHorizontalPriceSelected"));
					return false;
				}
			}
			
			return true;
		},
		
		
		/**
		 * Gets the HorizontalLine as JSONModel that can be further processed by the WebService.
		 */
		getHorizontalLineModel : function (oCallingController) {
			var oHorizontalLineWS = new JSONModel();
			var oInstrumentComboBox = oCallingController.getView().byId("instrumentComboBox");
			var oSelectedCoordinateModel = oCallingController.getView().getModel("selectedCoordinates");
			
			oHorizontalLineWS.setProperty("/instrumentId", oInstrumentComboBox.getSelectedKey());
			oHorizontalLineWS.setProperty("/price", oSelectedCoordinateModel.getProperty("/price"));
			
			return oHorizontalLineWS;
		}
	};
});