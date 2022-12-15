sap.ui.define(['sap/ui/thirdparty/jquery'],
	function(jQuery) {
	"use strict";

	var ScanResultsPersoService = {
		
		/**
		 * Initial colum settings of the Personalization dialog.
		 */
		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "trading-cockpit-frontend-quotationTable-symbolColumn",
					order: 0,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-nameColumn",
					order: 1,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-typeColumn",
					order: 2,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-rsNumberColumn",
					order: 3,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-sectorRsNumberColumn",
					order: 4,
					visible: false
				},
				{
					id: "trading-cockpit-frontend-quotationTable-industryGroupRsNumberColumn",
					order: 5,
					visible: false
				},
				{
					id: "trading-cockpit-frontend-quotationTable-performance5DaysColumn",
					order: 6,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-distanceTo52WeekHighColumn",
					order: 7,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-bollingerBandWidthColumn",
					order: 8,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-volumeDifferential10DaysColumn",
					order: 9,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-upDownVolumeRatioColumn",
					order: 10,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-liquidityColumn",
					order: 11,
					visible: false
				},
				{
					id: "trading-cockpit-frontend-quotationTable-baseLengthWeeksColumn",
					order: 12,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-chartColumn",
					order: 13,
					visible: true
				}
			]
		},
		
		
		/**
		 * Colum settings to be set when user clicks reset in Personalization dialog.
		 */
		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "trading-cockpit-frontend-quotationTable-symbolColumn",
					order: 0,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-nameColumn",
					order: 1,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-typeColumn",
					order: 2,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-rsNumberColumn",
					order: 3,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-sectorRsNumberColumn",
					order: 4,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-industryGroupRsNumberColumn",
					order: 5,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-performance5DaysColumn",
					order: 6,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-distanceTo52WeekHighColumn",
					order: 7,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-bollingerBandWidthColumn",
					order: 8,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-volumeDifferential10DaysColumn",
					order: 9,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-upDownVolumeRatioColumn",
					order: 10,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-liquidityColumn",
					order: 11,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-baseLengthWeeksColumn",
					order: 12,
					visible: true
				},
				{
					id: "trading-cockpit-frontend-quotationTable-chartColumn",
					order: 13,
					visible: true
				}
			]
		},
		
		
		/**
		 * Retrieves the personalization bundle.
T		 * This must return a jQuery Promise, which resolves in the desired table state.
		 */
		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			oDeferred.resolve(this._oBundle);
			// setTimeout(function() {
			// 	oDeferred.resolve(this._oBundle);
			// }.bind(this), 2000);
			return oDeferred.promise();
		},


		/**
		 * Stores the personalization bundle, overwriting any previous bundle completely.
		 * This must return a jQuery promise.
		 */
		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		/**
		 * Retrieves the desired reset state. This getter is used by the TablePersoController if the resetAllMode is ServiceReset.
		 * This must return a jQuery promise. 
		 */
		getResetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			// oDeferred.resolve(this.oResetData);

			setTimeout(function() {
				oDeferred.resolve(this.oResetData);
			}.bind(this), 2000);

			return oDeferred.promise();
		}
	};

	return ScanResultsPersoService;
});
