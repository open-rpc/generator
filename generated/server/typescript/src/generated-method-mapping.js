"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// also here to appease TS gods. Will get wiped away later.
var throwAwayMethodMapping = {
    foo: function () { return Promise.resolve("Bar"); },
};
exports.default = throwAwayMethodMapping;
