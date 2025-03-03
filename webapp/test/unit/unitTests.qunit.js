/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"z_hw1_tultt3/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
