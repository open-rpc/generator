import { template } from "lodash";

export default template(`
import * as jayson from "jayson/promise";
import ajv from "ajv";
import _ from "lodash";
import { generateMethodParamId } from "@open-rpc/schema-utils-js";

class ParameterValidationError extends Error {
  constructor(public message: string, public errors: ajv.ErrorObject[] | undefined | null) {
    super(message);
  }
}
<%= _(typeDefs).values().uniqBy('typeName').map('typings').value().join('') %>
export default class <%= className %> {
  public rpc: jayson.Client;
  public methods: any[];
  private validator: ajv.Ajv;

  constructor(options: any) {
    this.methods = <%= JSON.stringify(methods, undefined, "  ") %>;
    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }
    this.rpc = (jayson.Client as any)[options.transport.type](options.transport);
    this.validator = new ajv();
    this.methods.forEach((method) => {
      method.params.forEach((param: any, i: number) => {
        return this.validator.addSchema(
          param.schema,
          generateMethodParamId(method, param),
        );
      })
    });
  }

  public validate(methodName: string, methodObject: any, params: any[]) {
    return _.chain((methodObject as any).params)
      .map((param: any, index: number) => {
        const idForMethod = generateMethodParamId(methodObject, param);
        const isValid = this.validator.validate(idForMethod, params[index]);
        if (!isValid) {
          const message = [
            "Expected param in position ",
            index,
            " to match the json schema: ",
            JSON.stringify(param.schema, undefined, "  "),
            ". The function received instead ",
            params[index],
            ".",
          ].join("");
          const err = new ParameterValidationError(message, this.validator.errors);
          return err;
        }
      })
      .compact()
      .value();
  }

  public request({method, params}: any) {
    const methodObject = _.find(this.methods, ({name}: any) => name === method);
    const openRpcMethodValidationErrors = this.validate(method, methodObject, params);
    if (openRpcMethodValidationErrors.length > 0) {
      return Promise.reject(openRpcMethodValidationErrors);
    }

    let rpcParams;
    if (methodObject.paramStructure && methodObject.paramStructure === "by-name") {
      rpcParams = _.zipObject(params, _.map(methodObject.params, "name"));
    } else {
      rpcParams = Array.from(arguments);
    }
    const result: any = this.rpc.request(method, rpcParams);
    return result.then((r: any) => r.result);
  }

  <% methods.forEach((method, i) => { %><% const paramNames = _.uniqBy(method.params, 'name').length === method.params.length ? _.map(method.params, 'name') : _.map(method.params, (param, i) => param.name + i) %>
  /**
   * <%= method.summary %>
   */
  public <%= method.name %>(<%= _.map(method.params, (param, i) => paramNames[i] + ': ' + typeDefs[generateMethodParamId(method, param)].typeName).join(', ') %>): Promise<<%= (typeDefs[generateMethodParamId(method, method.result)] || {typeName: 'any'}).typeName %>> {
    return this.request({method: "<%= method.name %>", params: Array.from(arguments)});
  }<% }) %>
}
`);
