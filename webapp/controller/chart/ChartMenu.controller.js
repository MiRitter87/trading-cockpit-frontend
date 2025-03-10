sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("trading-cockpit-frontend.controller.chart.ChartMenu", {
		/**
		 * Handles click at the Advance/Decline Number tile.
		 */
		onAdvanceDeclineNumberPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAdvanceDeclineNumberRoute");	
		},
		
		
		/**
		 * Handles click at the Quota above SMA(50) tile.
		 */
		onAboveSma50Pressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAboveSma50Route");	
		},
		
		
		/**
		 * Handles click at the Quota above SMA(200) tile.
		 */
		onAboveSma200Pressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAboveSma200Route");	
		},
		
		
		/**
		 * Handles click at the Ritter Market Trend tile.
		 */
		onRmtPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartRitterMarketTrendRoute");	
		},
		
		
		/**
		 * Handles click at the Ritter Pattern Indicator tile.
		 */
		onRpiPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartRitterPatternIndicatorRoute");	
		},
		
		
		/**
		 * Handles click at the Price/Volume tile.
		 */
		onPriceVolumePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartPriceVolumeRoute");	
		},
		
		/**
		 * Handles click at the Price/Volume (TradingView) tile.
		 */
		onPriceVolumeTVPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartPriceVolumeTVRoute");	
		},
		
		
		/**
		 * Handles click at the Distribution Days tile.
		 */
		onDistributionDaysPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartDistributionDaysRoute");
		},
		
		
		/**
		 * Handles click at the Follow-Through Days tile.
		 */
		onFollowThroughDaysPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartFollowThroughDaysRoute");
		},
		
		
		/**
		 * Handles click at the Pocket Pivots tile.
		 */
		onPocketPivotsPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartPocketPivotsRoute");
		},
		
		
		/**
		 * Handles click at the Health Check tile.
		 */
		onHealthCheckPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartHealthCheckRoute");
		},
		
		
		/**
		 * Handles click at the Health Check (TradingView) tile.
		 */
		onHealthCheckTVPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartHealthCheckTVRoute");
		},
		
		
		/**
		 * Handles click at the Aggregate Indicator tile.
		 */
		onAggregateIndicatorPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("chartAggregateIndicatorRoute");
		}
	});
});