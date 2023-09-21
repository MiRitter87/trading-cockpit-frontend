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
			NDQ: 'NDQ',
			AMEX: 'AMEX',
			OTC: 'OTC',
			LSE: 'LSE'
		},
		
		INSTRUMENT_TYPE: {
			STOCK: 'STOCK',
			ETF: 'ETF',
			SECTOR: 'SECTOR',
			INDUSTRY_GROUP: 'IND_GROUP',
			RATIO: 'RATIO'
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
			DOWN_ON_VOLUME: 'DOWN_ON_VOLUME',
			NEAR_52_WEEK_HIGH: 'NEAR_52_WEEK_HIGH',
			NEAR_52_WEEK_LOW: 'NEAR_52_WEEK_LOW',
			RS_SINCE_DATE: 'RS_SINCE_DATE',
			THREE_WEEKS_TIGHT: 'THREE_WEEKS_TIGHT',
			HIGH_TIGHT_FLAG: 'HIGH_TIGHT_FLAG',
			SWING_TRADING_ENVIRONMENT: 'SWING_TRADING_ENVIRONMENT',
			RS_NEAR_HIGH_IG: 'RS_NEAR_HIGH_IG'
		},
		
		SCAN_SCOPE: {
			ALL: 'ALL',
			INCOMPLETE: 'INCOMPLETE'
		},
		
		CHART_TYPE: {
			ADVANCE_DECLINE_NUMBER: 'ADVANCE_DECLINE_NUMBER',
			INSTRUMENTS_ABOVE_SMA50: 'INSTRUMENTS_ABOVE_SMA50',
			DISTRIBUTION_DAYS: 'DISTRIBUTION_DAYS',
			FOLLOW_THROUGH_DAYS: 'FOLLOW_THROUGH_DAYS',
			RITTER_MARKET_TREND: 'RITTER_MARKET_TREND',
			RITTER_PATTERN_INDICATOR: 'RITTER_PATTERN_INDICATOR',
			POCKET_PIVOTS: 'POCKET_PIVOTS',
			PRICE_VOLUME: 'PRICE_VOLUME'
		},
		
		CHART_INDICATOR: {
			NONE: 'NONE',
			RS_LINE: 'RS_LINE',
			BBW: 'BBW',
			SLOW_STOCHASTIC: 'SLOW_STOCHASTIC'
		},
		
		CHART_OVERLAY: {
			EMA_21: 'EMA_21',
			SMA_50: 'SMA_50',
			SMA_150: 'SMA_150',
			SMA_200: 'SMA_200'
		},
		
		CHART_OBJECT_TYPE: {
			HORIZONTAL_LINE: 'HORIZONTAL_LINE'
		},
		
		PROTOCOL_ENTRY_CATEGORY: {
			CONFIRMATION: 'CONFIRMATION',
			VIOLATION: 'VIOLATION',
			UNCERTAIN: 'UNCERTAIN'
		},
		
		CURRENCY: {
			USD: 'USD',
			CAD: 'CAD',
			GBP: 'GBP'
		}
    };
	
	return constants;
});