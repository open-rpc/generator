module.exports = require('lodash').template(`
import * as jayson from "jayson/promise";
import ajv from "ajv";
import _ from "lodash";
import { makeIdForMethodContentDescriptors } from "@open-rpc/schema-utils-js";

class ParameterValidationError extends Error {
  constructor(public message: string, public errors: Array<ajv.ErrorObject>) {
    super(message);
  }
}

<%= _(typeDefs).values().uniqBy('typeName').map('typings').value().join('') %>

export default class <%= className %> {
  rpc: jayson.Client;
  methods: Array<any>;
  validator: ajv.Ajv;

  constructor(options) {
    this.methods = <%= JSON.stringify(methods) %>;
    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }

    this.rpc = jayson.Client[options.transport.type](options.transport);

    this.validator = new ajv();
    this.methods.forEach((method) => {
      method.params.forEach((param, i) => this.validator.addSchema(param.schema, makeIdForMethodContentDescriptors(method, param)));
    });
  }

  <% methods.forEach((method, i) => { %>
  /**
   * <%= method.summary %>
   */

  <%= method.name %>(<%= _.map(method.params, (param) => param.name + ': ' + typeDefs[makeIdForMethodContentDescriptors(method, param)].typeName).join(', ') %>): Promise<<%= (typeDefs[makeIdForMethodContentDescriptors(method, method.result)] || {typeName: 'any'}).typeName %>> {
    const params = Array.from(arguments);
    const methodName = '<%= method.name %>';
    const methodObject = _.find(this.methods, (m) =>  m.name === methodName);

    const errors = _.chain(methodObject.params)
        .map((param, index) => {
        const isValid = this.validator.validate(makeIdForMethodContentDescriptors(methodObject, param), params[index]);
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
          const err = new ParameterValidationError(message, this.validator.errors);
          return err;
        }
      })
      .compact()
      .value();

    if (errors.length > 0) {
      return Promise.reject(errors);
    }

    <% if (method.paramStructure && method.paramStructure === "by-name") { %>
    const rpcParams = _.zipObject(params, <%= _.map(methodObject.params, "name") %>);
    <% } else { %>
    const rpcParams = params;
    <% } %>
    const result : any = this.rpc.request("<%= method.name %>", rpcParams);
    return result;
  }

  <% }) %>
}
`);
