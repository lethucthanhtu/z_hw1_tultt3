sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    (Controller) => {
        "use strict";

        return Controller.extend("controller.App", {
            onInit() {},

            onAfterRendering() {
                //@ts-ignore
                // eslint-disable-next-line no-console
                console.clear();
            }
        });
    }
);
