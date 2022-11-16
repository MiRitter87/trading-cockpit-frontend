sap.ui.define([
	
], function () {
	"use strict";
	
	/**
	 * Constants.
	 */
	var constants = {
		STOCK_EXCHANGE: {
			TSX: 'TSX',
			TSXV: 'TSXV',
			CSE: 'CSE',
			NYSE: 'NYSE'			
		},
		
		INSTRUMENT_TYPE: {
			STOCK: 'STOCK',
			ETF: 'ETF',
			SECTOR: 'SECTOR',
			INDUSTRY_GROUP: 'IND_GROUP'
		},
		
		ALERT_TYPE: {
			LESS_OR_EQUAL: 'LESS_OR_EQUAL',
			GREATER_OR_EQUAL: 'GREATER_OR_EQUAL'
		},
		
		ALERT_TRIGGER_STATUS: {
			ALL: 'ALL',
			TRIGGERED: 'TRIGGERED',
			NOT_TRIGGERED: 'NOT_TRIGGERED'
		},
		
		ALERT_CONFIRMATION_STATUS: {
			ALL: 'ALL',
			CONFIRMED: 'CONFIRMED',
			NOT_CONFIRMED: 'NOT_CONFIRMED'
		},
		
		SCAN_STATUS: {
			IN_PROGRESS: 'IN_PROGRESS',
			FINISHED: 'FINISHED'
		},
		
		SCAN_TEMPLATE: {
			ALL: 'ALL',
			MINERVINI_TREND_TEMPLATE: 'MINERVINI_TREND_TEMPLATE',
			VOLATILITY_CONTRACTION_10_DAYS: 'VOLATILITY_CONTRACTION_10_DAYS',
			BREAKOUT_CANDIDATES: 'BREAKOUT_CANDIDATES',
			UP_ON_VOLUME: 'UP_ON_VOLUME'
		}
    };
	
	return constants;
});