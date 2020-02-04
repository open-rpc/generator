import { Server, IServerOptions } from "@open-rpc/server-js";
import { IHTTPServerTransportOptions } from "@open-rpc/server-js/build/transports/http";
import { IWebSocketServerTransportOptions } from "@open-rpc/server-js/build/transports/websocket";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import methodMapping from "./generated-method-mapping";
import doc from "./openrpc.json";

export async function start() {
  const serverOptions: IServerOptions = {
    openrpcDocument: await parseOpenRPCDocument(doc as OpenrpcDocument),
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

  console.log("Starting Server"); // tslint:disable-line
  const s = new Server(serverOptions);

  s.start();
}
