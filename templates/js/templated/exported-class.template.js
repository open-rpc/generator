module.exports = require('lodash').template(`
import * as jayson from "jayson/promise";

export default class <%= className %> {
  rpc: jayson.Client;

  constructor(options) {
    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }

    this.rpc = jayson.client[options.transport.type](options.transport);
  }
  <% methods.forEach((method, i) => { %>
  <%= method.name %>(...params: Array<any>): jayson.JSONRPCRequest {
    return this.rpc.request("<%= method.name %>", params);
  }
  <% }) %>
}
`);
