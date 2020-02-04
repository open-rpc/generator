import { Server, IServerOptions } from "@open-rpc/server-js";
import { IHTTPServerTransportOptions } from "@open-rpc/server-js/build/transports/http";
import { IWebSocketServerTransportOptions } from "@open-rpc/server-js/build/transports/websocket";
import { OpenrpcDocument } from "@open-rpc/meta-schema";

import methodMapping from "./generated-method-mapping";
import doc from "./openrpc.json";

const serverOptions: IServerOptions = {
  openrpcDocument: doc as OpenrpcDocument,
  transportConfigs: [
    {
      type: "HTTPTransport",
      options: {
        port: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 4441,
        middleware: [],
      } as IHTTPServerTransportOptions,
    },
    {
      type: "WebSocketTransport",
      options: {
        port: process.env.WS_PORT || 3331,
        middleware: [],
      } as IWebSocketServerTransportOptions,
    },
  ],
  methodMapping,
};

export function start() {
  console.log("Starting Server"); // tslint:disable-line
  const s = new Server(serverOptions);

  s.start();
}
