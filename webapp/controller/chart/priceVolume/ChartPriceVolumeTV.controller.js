sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../scan/ScanController",
	"../../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"./lightweight-charts.standalone.production"
], function (Controller, ScanController, Constants, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.priceVolume.ChartPriceVolumeTV", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("chartPriceVolumeTVRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query only instruments that have quotations referenced. Otherwise no chart could be created.
			ScanController.queryQuotationsByWebService(this.queryQuotationsCallback, this, false, Constants.SCAN_TEMPLATE.ALL);
		},
		
		
		/**
    	 * Handles the button press event of the chart information button.
    	 */
    	onChartInformationPressed : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var mOptions = new Object();
			var sTitle = oResourceBundle.getText("chartPriceVolumeTV.info.title");
			var sDescription = oResourceBundle.getText("chartPriceVolumeTV.info.description");
			
			mOptions.title = sTitle;
			MessageBox.information(sDescription, mOptions);
		},
		
		
		/**
		 * Handles the selection of an Instrument.
		 */
		onInstrumentSelectionChange : function (oControlEvent) {
			//TODO: Only display volume bars, if instrument is not of type RATIO.
		},
		
		
		/**
    	 * Handles the button press event of the refresh chart button.
    	 */
    	onRefreshPressed : function() {
			var sDivId = "chartContainer";
			
			//Remove previously created chart for subsequent chart creations
			document.getElementById(sDivId).innerHTML = "";
	
			const chart = LightweightCharts.createChart(document.getElementById("chartContainer"), {
  				width: document.getElementById("chartContainer").clientWidth,
                height: document.getElementById("chartContainer").clientHeight,
                layout: {
                    backgroundColor: 'white',
                    textColor: 'black',
                },
                grid: {
                    vertLines: {
                        color: '#eee',
                    },
                    horzLines: {
                        color: '#eee',
                    },
                },
            });

            // Sample Data
            const lineSeries = chart.addLineSeries({
                color: 'rgb(55, 128, 255)',
                lineWidth: 2,
            });
            
            lineSeries.setData([
                { time: '2023-01-01', value: 100 },
                { time: '2023-01-02', value: 101 },
                { time: '2023-01-03', value: 99 },
                { time: '2023-01-04', value: 105 },
                { time: '2023-01-05', value: 98 },
            ]);
		},
		
		
		/**
		 * Callback function of the queryQuotationsByWebService RESTful WebService call in the ScanController.
		 */
		queryQuotationsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if (oReturnData.data !== null) {
				oModel.setSizeLimit(300);
				oModel.setData(oReturnData.data);
			}
			
			if (oReturnData.data === null && oReturnData.message !== null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "quotations");
		}
	});
});