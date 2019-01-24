import fetch from "node-fetch";

export type TJsonRpcRequest = {
  method: string,
  params?: any,
  id: number,
};

export type TJsonRpcResponse = {
  jsonrpc: string,
  result?: any,
  error?: any,
};

export interface ITransport {
  request(request: TJsonRpcRequest): Promise<TJsonRpcResponse>;
}

export class TransportError extends Error {
  constructor(errorResponse: any) {
    super(errorResponse.statusText);
  }
}

export class HttpTransport implements ITransport {
  baseHeaders = { "Content-Type": "application/json" };
  baseBody = { jsonrpc: "2.0" };

  constructor(private url: string, private headers: any) {}

  async request(request: TJsonRpcRequest): Promise<TJsonRpcResponse> {
    const opt = {
      method: "POST",
      headers: { ...this.baseHeaders, ...this.headers },
      body: JSON.stringify({ ...this.baseBody, ...request }),
    };

    const response = await fetch(this.url, opt);

    if (response.status !== 200) {
      throw new TransportError(response);
    }

    return response.json();
  }
}

export class JsonRpcError extends Error {
  code: number;
  constructor(error: {code: number, message: string}) {
    super(error.message);
    this.message = error.message;
    this.name = this.constructor.name;
    this.code = error.code;
  }
}

export default class JsonRpc {
  requestSeq: number;
  transport: ITransport;

  constructor(options) {
    if (options.transport.type === "http") {
      this.transport = new HttpTransport(options.transport.url, options.transport.headers);
    }
    this.requestSeq = 1;
  }

  async call(method: string, params?: any): Promise<any> {
    const request = this.newRequest(method, params);

    const json = await this.transport.request(request);

    if (typeof json.result !== "undefined") {
      return json.result;
    } else if (json.error) {
      throw new JsonRpcError(json.error);
    } else {
      throw new Error("Unhandled error. Json response included neither a result or error.");
    }
  }

  newRequest(method: string, params?: any): TJsonRpcRequest {
    return { method, params, id: this.requestSeq += 1 };
  }
}
