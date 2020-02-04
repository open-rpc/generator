"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_js_1 = require("@open-rpc/server-js");
var generated_method_mapping_1 = __importDefault(require("./generated-method-mapping"));
var openrpc_json_1 = __importDefault(require("./openrpc.json"));
var serverOptions = {
    openrpcDocument: openrpc_json_1.default,
    transportConfigs: [
        {
            type: "HTTPTransport",
            options: {
                port: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 4441,
                middleware: [],
            },
        },
        {
            type: "WebSocketTransport",
            options: {
                port: process.env.WS_PORT || 3331,
                middleware: [],
            },
        },
    ],
    methodMapping: generated_method_mapping_1.default,
};
function start() {
    console.log("Starting Server"); // tslint:disable-line
    var s = new server_js_1.Server(serverOptions);
    s.start();
}
exports.start = start;
