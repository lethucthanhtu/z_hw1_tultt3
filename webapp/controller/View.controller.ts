sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'zhw1tultt3/utils/Utils',
    'sap/m/MessageToast',
    'sap/m/Text',
    'sap/ui/core/Icon',
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/ui/model/json/JSONModel',
    'sap/m/HBox',
    'sap/m/ObjectIdentifier',
    'sap/m/ObjectNumber',
    "sap/ui/model/BindingMode"
],( Controller,
    Utils,
    MessageToast,
    Text,
    Icon,
    ColumnListItem,
    Input,
    JSONModel,
    HBox,
    ObjectIdentifier,
    ObjectNumber,
    BindingMode ) => {
    'use strict';

    let _oView,
        _oSmartTable,
        _oTable,
        _oModel,
        _oLocalModel,
        _aDeleteItems = [],
        _aAddItems = [],
        _sLocalModel = 'localModel',
        bTEditVisible = '{= ${localModel>/bEditVisible}}',
        bFEditVisible = '{= !${localModel>/bEditVisible}}';

    return Controller.extend('zhw1tultt3.controller.View', {
        /**
         * @override
         */
        onInit() {
            let localModel = new JSONModel({
                bEditVisible: false,
                bEditable: false
            });
            _oView = this.getView();
            _oView.setModel(localModel, _sLocalModel);
            _oLocalModel = _oView.getModel(_sLocalModel);
        },

        /**
         * @override
         */
        onBeforeRendering() {
            _oSmartTable = _oView.byId('idSmartTable');
            _oTable = _oSmartTable.getTable();
            _oModel = _oSmartTable.getModel();
            _oModel.setDefaultBindingMode(BindingMode.TwoWay);
            _oModel.setUseBatch(false);
        },

        /**
         * @override
         */
        onAfterRendering() { },

        /**
         * @override
         */
        onExit() { },

        /**
         * handle change status of generic tag
         * @param {boolean} bUpdate
         */
        _handleUpdateStatusTag(bUpdate) {
            let oGenericTag = _oView.byId('idGenericTag'),
                sText = 'Not Updated',
                sStatus = 'Success';
            if (bUpdate) {
                sText = 'Updated';
                sStatus = 'Warning';
            }
            oGenericTag.setText(sText);
            oGenericTag.setStatus(sStatus);
        },

        /**
         * handle validate input from user in edit mode
         * @param {typeof sap.m.Input} oInput
         * @returns {boolean}
         */
        _validateInput(oInput) {
            let sValueState = 'None',
                bValidationError = false,
                oBinding = oInput.getBinding('value');
            try {
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oException) {
                sValueState = 'Error';
                bValidationError = true;
            }
            oInput.setValueState(sValueState);
            return bValidationError;
        },

        /**
         * handle turn on/off editable for specific row
         * @param {Array} aItems for list of row to enable/disable edit mode
         * @param {boolean} bEditable to turn on/off edit mode in aItems
         */
        _handleEditableRows(aItems, bEditable) {
            aItems.forEach(item => {
                let aCells = item.getCells(),
                    oIcon = aCells[0];
                if (!bEditable) {
                    oIcon.setSrc(Utils.parseURI('delete'));
                    oIcon.setColor('red');
                }
                aCells.forEach(cell => {
                    if (cell instanceof HBox) {
                        let oInput = cell.getItems()[1];
                        oInput.setEditable(bEditable);
                    }
                });
            });
        },

        /**
         * handle reset to default of status column
         */
        _handleResetEditStatusColumn() {
            _oTable.getItems().forEach(row => {
                let oIcon = row.getCells()[0];
                oIcon.setColor(null);
                oIcon.setSrc(null);
            });
        },

        /**
         * handle change theme in UI
         */
        onChangeTheme() { },

        /**
         * handle reset everything to default state
         */
        onReset() {
            MessageToast.show('Restore to default');
            this._handleUpdateStatusTag(false); // reset tag
            // reset add
            if (_aAddItems && _aAddItems.length > 0)
                _aAddItems.forEach(item => {
                    _oTable.removeItem(item);
                });
            _aAddItems = [];
            _oModel.resetChanges(); // reset update
            // reset delete
            this._handleEditableRows(_aDeleteItems, true);
            _aDeleteItems = [];
            // reset status
            this._handleResetEditStatusColumn();
            _oTable.removeSelection();
            // _oTable.clearSelection();
        },

        /**
         * handle send CRUD data to OData
         */
        onSend() {
            // handle send add
            if (_aAddItems && _aAddItems.length > 0)
                _aAddItems.forEach(item => {
                    let aData = [],
                        aCells = item.getCells();
                    aCells.forEach(oCell => {
                        if (oCell instanceof HBox) {
                            let oInput = oCell.getItems()[1];
                            aData.push(oInput.getValue());
                        }
                    });
                    let oNew = {
                        ProductID: `TU-${Utils.randomIntByLength(4)}`,
                        Name: aData[0],
                        SupplierID: `0100000056`,
                        SupplierName: aData[1],
                        Price: aData[2],
                        TypeCode: 'PR',
                        CurrencyCode: 'EUR',
                        Category: aData[3],
                        TaxTarifCode: 1,
                        MeasureUnit: 'EA'
                    };
                    let testModel = this.getView().getModel();
                    testModel.setUseBatch(false);
                    testModel.create('/ProductSet', oNew);
                });
            // handle send update
            if (_oModel.hasPendingChanges())
                _oModel.submitChanges();
            // handle send delete
            if (_aDeleteItems.length !== 0)
                _aDeleteItems.forEach(item => {
                    let sPath = item.getBindingContext().getDeepPath();
                    _oModel.remove(sPath);
                });
            this.onReset();
        },

        /**
         * handle add new row on top of table on Front-end
         */
        onAdd() {
            let oCliNewLine = new ColumnListItem({
                cells: [
                    new Icon({ src: 'sap-icon://add-document', color: 'green', tooltip: 'add' }),
                    new ObjectIdentifier({}),
                    new HBox({
                        items: [
                            new Text({ visible: bFEditVisible }),
                            new Input({ type: 'Text', visible: bTEditVisible, liveChange: this.onLiveChangeForAdd })
                        ]
                    }),
                    new ObjectIdentifier({}),
                    new HBox({
                        items: [
                            new Text({ visible: bFEditVisible }),
                            new Input({ type: 'Text', visible: bTEditVisible, liveChange: this.onLiveChangeForAdd })
                        ]
                    }),
                    new HBox({
                        items: [
                            new ObjectNumber({ visible: bFEditVisible }),
                            new Input({ type: 'Number', visible: bTEditVisible })
                        ]
                    }),
                    new HBox({
                        items: [
                            new Text({ visible: bFEditVisible }),
                            new Input({ type: 'Text', visible: bTEditVisible, liveChange: this.onLiveChangeForAdd })
                        ]
                    }),
                    new HBox({
                        items: [
                            new Text({ visible: bFEditVisible }),
                            new Input({ type: 'Text', visible: bTEditVisible, liveChange: this.onLiveChangeForAdd })
                        ]
                    })
                ]
            });
            _oTable.insertItem(oCliNewLine, 0);
            _aAddItems.push(oCliNewLine);
            this._handleUpdateStatusTag(true);
        },

        /**
         * handle remove item from OData
         */
        onRemove() {
            let aItems = _oTable.getSelectedItems();
            _aDeleteItems.push(...aItems);
            _aDeleteItems = [...new Set(_aDeleteItems)];
            // remove add front-end
            let aJoins = Utils.getJoin(_aAddItems, _aDeleteItems);
            if (aJoins) aJoins.forEach(item => _oTable.removeItem(item));
            let iLen = _aDeleteItems.length;
            this._handleUpdateStatusTag((iLen !== 0));
            this._handleEditableRows(aItems, false);
            // _oTable.clearSelection();
            MessageToast.show((iLen > 0) ? `${iLen} item(s) ready to be removed` : 'Nothing to remove');
        },

        /**
         * handle live change of input of OData's data in edit mode,
         * not include added items on Front-end
         * @param {*} oEvent
         */
        onLiveChange(oEvent) {
            let oInput = oEvent.getSource(),
                oHBox = oInput.getParent(),
                sOldValue = oInput.getName(),
                sNewValue = oEvent.getParameter('value'),
                oRow = oHBox.getParent(),
                oIcon = oRow.getCells()[0],
                sIcon,
                bCorrect = (sOldValue !== sNewValue);
            this._validateInput(oInput); // validate String
            if (!(_aDeleteItems.length !== 0 || _aAddItems.length !== 0))
                this._handleUpdateStatusTag(bCorrect);
            if (bCorrect) sIcon = 'write-new-document';
            oIcon.setSrc(Utils.parseURI(sIcon));
            oIcon.setColor('yellow');
        },

        /**
         * handle live change for added items on Front-end
         * @param {*} oEvent
         */
        onLiveChangeForAdd(oEvent) {
            let oInput = oEvent.getSource(),
                oHBox = oInput.getParent(),
                oText = oHBox.getItems()[0],
                sInput = oEvent.getParameter('value');
            oText.setText(sInput);
        },

        /**
         * Toggle edit mode
         * @param {*} oEvent
         */
        onEditMode(oEvent) {
            let bState = oEvent.getParameter('state');
            _oLocalModel.setProperty('/bEditVisible', bState);
        }
    });
});
