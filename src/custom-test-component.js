const path = require("path");
const { move, readFile, writeFile } = require("fs-extra");
const _ = require("lodash");
const components = require("./components");
const { getDefaultComponentTemplatePath } = components;

const { template } = _;
const tsTemplate = template(`
// Code generated by @custom-test generator DO NOT EDIT.
import { RequestManager, PostMessageWindowTransport, PostMessageIframeTransport, WebSocketTransport, HTTPTransport, Transport, Client, JSONRPCError } from "@open-rpc/client-js";
import _ from "lodash";
import { OpenrpcDocument as OpenRPC, MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { MethodCallValidator, MethodNotFoundError } from "@open-rpc/schema-utils-js";

<%= methodTypings.toString("typescript") %>

export interface Options {
  transport: {
    type: "websocket" | "http" | "https" | "postmessagewindow" | "postmessageiframe" | "injected";
    host: string;
    port: number;
    path?: string;
    protocol?: string;
    transport?: Transport;
  },
}

export class <%= className %> {
  public rpc: Client;
  public static openrpcDocument: OpenRPC = <%= JSON.stringify(openrpcDocument) %> ;
  public transport: HTTPTransport | WebSocketTransport | PostMessageWindowTransport | PostMessageIframeTransport | Transport;
  private validator: MethodCallValidator;
  private timeout: number | undefined;

  constructor(options: Options) {
    
    if (type === "injected" && options.transport.injected === undefined) {
      throw new Error("Missing injected transport");
    }

    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }
    const {type, host, port, protocol} = options.transport;
    let path = options.transport.path || "";
    if(path && path[0] !== "/") {
        path = "/" + path;
    }

    switch (type) {
      case 'injected':
        this.transport = options.transport.injected
        break;
      case 'http':
      case 'https':
        this.transport = new HTTPTransport((protocol || type) + "://" + host + ":" + port + path);
        break;
      case 'websocket':
        this.transport = new WebSocketTransport((protocol || "ws://") + host + ":" + port + path);
        break;
      case 'postmessageiframe':
        this.transport = new PostMessageIframeTransport(protocol + "://" + host + ":" + port + path);
        break;
      case 'postmessagewindow':
        this.transport = new PostMessageWindowTransport(protocol + "://" + host + ":" + port + path);
        break;
      default:
        throw new Error("unsupported transport");
        break;
    }
    this.rpc = new Client(new RequestManager([this.transport]));
    this.validator = new MethodCallValidator(<%= className %>.openrpcDocument);
  }
  /**
   * Adds a JSONRPC notification handler to handle receiving notifications.
   * @example
   * myClient.onNotification((data)=>console.log(data));
   */
  public onNotification(callback: (data: any) => void) {
    this.rpc.onNotification(callback);
  }

  /**
   * Adds an optional JSONRPCError handler to handle receiving errors that cannot be resolved to a specific request
   * @example
   * myClient.onError((err: JSONRPCError)=>console.log(err.message));
   */
  public onError(callback: (data: JSONRPCError) => void) {
     this.rpc.onError(callback);
  }

  /**
   * Sets a default timeout in ms for all requests excluding notifications.
   * @example
   * // 20s timeout
   * myClient.setDefaultTimeout(20000);
   * // Removes timeout from request
   * myClient.setDefaultTimeout(undefined);
   */
   public setDefaultTimeout(ms?: number) {
    this.timeout = ms;
  }

  /**
   * Initiates [[<%= className %>.startBatch]] in order to build a batch call.
   *
   * Subsequent calls to [[<%= className %>.request]] will be added to the batch.
   * Once [[<%= className %>.stopBatch]] is called, the promises for the [[<%= className %>.request]]
   * will then be resolved.  If there is already a batch in progress this method is a noop.
   *
   * @example
   * myClient.startBatch();
   * myClient.foo().then(() => console.log("foobar"))
   * myClient.bar().then(() => console.log("foobarbaz"))
   * myClient.stopBatch();
   */
  public startBatch(): void {
    return this.rpc.startBatch();
  }

  /**
   * Initiates [[Client.stopBatch]] in order to finalize and send the batch to the underlying transport.
   *
   * stopBatch will send the [[<%= className %>]] calls made since the last [[<%= className %>.startBatch]] call. For
   * that reason, [[<%= className %>.startBatch]] MUST be called before [[<%= className %>.stopBatch]].
   *
   * @example
   * myClient.startBatch();
   * myClient.foo().then(() => console.log("foobar"))
   * myClient.bar().then(() => console.log("foobarbaz"))
   * myClient.stopBatch();
   */
  public stopBatch(): void {
    return this.rpc.stopBatch();
  }

  private request(methodName: string, params: any[]): Promise<any> {
    const methodObject = _.find((<%= className %>.openrpcDocument.methods as MethodObject[]), ({name}) => name === methodName) as MethodObject;
    const notification = methodObject.result ? false : true;
    const openRpcMethodValidationErrors = this.validator.validate(methodName, params);
    if ( openRpcMethodValidationErrors instanceof MethodNotFoundError || openRpcMethodValidationErrors.length > 0) {
      return Promise.reject(openRpcMethodValidationErrors);
    }

    let rpcParams;
    if (methodObject.paramStructure && methodObject.paramStructure === "by-name") {
      rpcParams = _.zipObject(params, _.map(methodObject.params, "name"));
    } else {
      rpcParams = params;
    }
    if (notification) {
      return this.rpc.notify({method: methodName, params: rpcParams});
    }
    return this.rpc.request({method: methodName, params: rpcParams}, this.timeout);
  }

  <% openrpcDocument.methods.forEach((method) => { %>
  /**
   * <%= method.summary %>
   */
  // tslint:disable-next-line:max-line-length
  public <%= method.name %>: <%= methodTypings.getTypingNames("typescript", method).method %> = (...params) => {
    return this.request("<%= method.name %>", params);
  }
  <% }); %>
}
export default <%= className %>;
`);

const hooks = {
  afterCopyStatic: [
    async (dest, frm, component) => {
      if (component.language === "typescript") {
        return await move(
          path.join(dest, "_package.json"),
          path.join(dest, "package.json"),
          { overwrite: true }
        );
      }
    },
  ],
  afterCompileTemplate: [
    async (dest, frm, component, openrpcDocument) => {
      if (component.language === "typescript") {
        const packagePath = path.join(dest, "package.json");
        const fileContents = await readFile(packagePath);
        const pkg = JSON.parse(fileContents.toString());
        const updatedPkg = JSON.stringify({
          ...pkg,
          name: component.name,
          version: openrpcDocument.info.version,
        });

        return await writeFile(packagePath, updatedPkg);
      }
    },
  ],
  templateFiles: {
    typescript: [
      {
        path: "src/index.ts",
        template: tsTemplate,
      },
    ],
  },
};

module.exports = {
  hooks,
  staticPath: getDefaultComponentTemplatePath,
};
