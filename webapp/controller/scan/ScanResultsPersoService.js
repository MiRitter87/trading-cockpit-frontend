sap.ui.define(['sap/ui/thirdparty/jquery'],
	function(jQuery) {
	"use strict";

	var ScanResultsPersoService = {
		
		/**
		 * Colum settings to be set when user clicks reset in Personalization dialog.
		 */
		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "trading-cockpit-frontend-quotationTable-sectorRsNumberColumn",
					visible: false
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
