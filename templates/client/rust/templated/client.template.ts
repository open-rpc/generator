import { template } from "lodash";
import { OpenRPCTypingsSupportedLanguages } from "@open-rpc/typings";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;

<%= methodTypings.toString("rust", { includeSchemaTypings: true, includeMethodAliasTypings: false }) %>

jsonrpc_client!(pub struct <%= className %> {
  <%= methodTypings.toString("rust", { includeSchemaTypings: false, includeMethodAliasTypings: true }) %>
});
`);
