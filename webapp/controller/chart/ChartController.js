sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
	"use strict";
	return {
		/**
		 * Applies a Filter to the ComboBox for Instrument selection.
		 */
		applyFilterToInstrumentsComboBox : function (oComboxBox, aAllowedInstrumentTypes) {
			var oBinding = oComboxBox.getBinding("items");
			var aFilters = new Array();
			var oFilterType, oFilterTotal;
			
			if(aAllowedInstrumentTypes == undefined || aAllowedInstrumentTypes.length == 0)
				return;
				
			for(var i = 0; i < aAllowedInstrumentTypes.length; i++) {
				oFilterType = new Filter("instrument/type", FilterOperator.EQ, aAllowedInstrumentTypes[i]);
				aFilters.push(oFilterType);
			}
			
			if(oBinding == undefined)
				return;
			
			//Connect filters via logical "OR".
			var oFilterTotal = new Filter({
				filters: aFilters,
    			and: false
  			});
			
			oBinding.filter([oFilterTotal]);
		}
	};
});