sap.ui.define([
    'sap/ui/core/URI',
    "sap/ui/model/type/Integer"
], (URI,
    Integer) => {
    'use strict';

    return {
        /**
         * 'sap-icon://' + sIcon
         * if sIcon equal null
         * @param {String} sIcon
         * @returns {sap.ui.core.URI}
         */
        parseURI(sIcon: String) {
            let sURI = 'sap-icon://';
            if (sIcon === null || sIcon === undefined)
                sURI = null;
            else
                sURI += sIcon;
            return URI.parseValue(sURI);
        },

        /**
         * 
         * @param {Number} min
         * @param {Number} max
         * @returns {Number}
         */
        randomIntInRange(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },

        randomIntByLength(iLength: number) {
            let result = '';
            for (; iLength > 0; iLength--)
                result += this.randomIntInRange(0, 10);
            return parseInt(result, 10);
        },

        getJoin(arr1, arr2) {
            if (arr1 && arr2)
                return arr1.filter(e => arr2.indexOf(e) !== -1);
            return null;
        }
    };
});