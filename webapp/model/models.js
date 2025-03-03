sap.ui.define([
    'sap/ui/model/json/JSONModel',
    'sap/ui/Device',
    'sap/ui/model/BindingMode'
],
    /**
     * provide app-view type models (as in the first 'V' in MVVC)
     *
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     *
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    (JSONModel, Device, BindingMode) => {
        'use strict';

        return {
            // @ts-ignore
            createDeviceModel() {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode(BindingMode.TwoWay);
                return oModel;
            }
        };
    });