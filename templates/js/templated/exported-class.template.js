module.exports = require('lodash').template(`
import * as jayson from "jayson/promise";
import Djv from "djv";
import { zipObject } from "lodash";

export default class <%= className %> {
  rpc: jayson.Client;

  constructor(options) {
    this.methods = <%= JSON.stringify(methods) %>;
    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }

    this.rpc = jayson.client[options.transport.type](options.transport);

    this.validators = {};
    this.methods.forEach((method) => {
      if (!method.params) {
        this.validators[method.name] = [];
        return;
      }
      this.validators[method.name] = method.params.map((param) => new Djv().addSchema(method.name, param.schema));
    });
  }

  <% methods.forEach((method, i) => { %>
  <%= method.name %>(...params: Array<any>): jayson.JSONRPCRequest {
    params.forEach((param, i) => this.validators['<%= method.name %>'][i].validate(param));
    <% if (method.paramStructure && method.paramStructure === "by-name") { %>
    const rpcParams = zipObject(params, <%= _.map(method.params, 'name') %>);
    <% } else { %>
    const rpcParams = params;
    <% } %>
    return this.rpc.request("<%= method.name %>", rpcParams);
  }

  <% }) %>
}
`);
