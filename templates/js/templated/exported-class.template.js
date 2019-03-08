module.exports = require('lodash').template(`
import * as jayson from "jayson/promise";
import Ajv from "ajv";
import { zipObject } from "lodash";
import { makeIdForMethodContentDescriptors } from "@open-rpc/schema-utils-js";

<%= _(typeDefs).values().uniqBy('typeName').map('typings').value().join('') %>

export default class <%= className %> {
  rpc: jayson.Client;
  methods: Array<any>;
  validators: any;

  constructor(options) {
    this.methods = <%= JSON.stringify(methods) %>;
    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }

    this.rpc = jayson.Client[options.transport.type](options.transport);

    this.validator = new Ajv();
    this.methods.forEach((method) => {
      method.params.forEach((param, i) => this.validator.addSchema(param.schema, makeIdForMethodContentDescriptors(method, param)));
    });
  }

  <% methods.forEach((method, i) => { %>
  /**
   * <%= method.summary %>
   */
  <%= method.name %>(<%= _.map(method.params, (param) => param.name + ': ' + typeDefs[makeIdForMethodContentDescriptors(method, param)].typeName).join(', ') %>): Promise<<%= typeDefs[makeIdForMethodContentDescriptors(method, method.result)].typeName %>> {
    const params = Array.from(arguments);

    const errors = _(method.params)
      .map((param, index) => {
        const isValid = this.validator.validate(makeIdForMethodContentDescriptors(method, param), params[index]);
        const message = [
          "Expected param in position ",
          index,
          " to match the json schema: ",
          JSON.stringify(param.schema, undefined, '\t'),
          ". The function received instead ",
          params[index],
          "."
        ].join("");

        if (!isValid) {
          const err = new Error(message);
          err.data = this.validator.errors;
          return err;
        }
      })
      .compact()
      .value();

    if (validationErrors.length > 0) {
      return Promise.reject(errors);
    }


    params.forEach((param, i) => this.validator.validate(makeIdForMethodContentDescriptors(methd, param));
    <% if (method.paramStructure && method.paramStructure === "by-name") { %>
    const rpcParams = zipObject(params, <%= _.map(method.params, "name") %>);
    <% } else { %>
    const rpcParams = params;
    <% } %>
    return this.rpc.request("<%= method.name %>", rpcParams);
  }

  <% }) %>
}
`);
