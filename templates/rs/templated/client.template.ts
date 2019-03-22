import { template } from "lodash";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;
extern crate jsonrpc_client_http;

use jsonrpc_client_http::HttpTransport;

<%= _.chain(typeDefs).values().uniqBy("typeName").map("typing").value().join("") %>

jsonrpc_client!(pub struct <%= className %> {
<% methods.forEach((method) => { %>
    <%= getFunctionSignature(method, typeDefs) %>
<% }); %>
});
`);
