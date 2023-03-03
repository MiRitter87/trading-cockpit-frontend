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
			NYSE: 'NYSE',
			LSE: 'LSE'
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
		
		SCAN_EXECUTION_STATUS: {
			IN_PROGRESS: 'IN_PROGRESS',
			FINISHED: 'FINISHED'
		},
		
		SCAN_COMPLETION_STATUS: {
			COMPLETE: 'COMPLETE',
			INCOMPLETE: 'INCOMPLETE'
		},
		
		SCAN_TEMPLATE: {
			ALL: 'ALL',
			MINERVINI_TREND_TEMPLATE: 'MINERVINI_TREND_TEMPLATE',
			VOLATILITY_CONTRACTION_10_DAYS: 'VOLATILITY_CONTRACTION_10_DAYS',
			BREAKOUT_CANDIDATES: 'BREAKOUT_CANDIDATES',
			UP_ON_VOLUME: 'UP_ON_VOLUME',
			DOWN_ON_VOLUME: 'DOWN_ON_VOLUME'
		},
		
		CHART_TYPE: {
			ADVANCE_DECLINE_NUMBER: 'ADVANCE_DECLINE_NUMBER',
			INSTRUMENTS_ABOVE_SMA50: 'INSTRUMENTS_ABOVE_SMA50',
			DISTRIBUTION_DAYS: 'DISTRIBUTION_DAYS',
			FOLLOW_THROUGH_DAYS: 'FOLLOW_THROUGH_DAYS'
		},
		
		
		SCAN_SCOPE: {
			ALL: 'ALL',
			INCOMPLETE: 'INCOMPLETE'
		},
		
		
		PROTOCOL_ENTRY_CATEGORY: {
			CONFIRMATION: 'CONFIRMATION',
			VIOLATION: 'VIOLATION',
			UNCERTAIN: 'UNCERTAIN'
		}
    };
	
	return constants;
});