sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function(DateFormat) {
	"use strict";
	return {
		/**
		 * Formats the date provided by the backend WebService as milliseconds since 01/01/1970 to a human readable form.
		 * The formatted result contains date and time.
		 */
		wsDateTimeFormatter: function(timestamp) {
			var oDateFormat, oDate, sFormattedDate;
			
			if (typeof timestamp === 'undefined' || timestamp === null) {
				return "";				
			}
			else {
				oDateFormat = DateFormat.getDateInstance({pattern : "dd.MM.YYYY HH:mm:ss"});
				oDate = new Date(parseInt(timestamp))
				sFormattedDate = oDateFormat.format(oDate);
				
				return sFormattedDate;
			}
		},
		
		/**
		 * Formats the date provided by the backend WebService as milliseconds since 01/01/1970 to a human readable form.
		 * The formatted result contains only the date and no time component.
		 */
		wsDateFormatter: function(timestamp) {
			var oDateFormat, oDate, sFormattedDate;
			
			if (typeof timestamp === 'undefined' || timestamp === null) {
				return "";				
			}
			else {
				oDateFormat = DateFormat.getDateInstance({pattern : "dd.MM.YYYY"});
				oDate = new Date(parseInt(timestamp))
				sFormattedDate = oDateFormat.format(oDate);
				
				return sFormattedDate;
			}
		}
	};
});