import { template } from "lodash";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;

<%= _.chain(typeDefs).values().uniqBy("typeName").map("typing").value().join("") %>

jsonrpc_client!(pub struct <%= className %> {
<% methods.forEach((method) => { %>
    <%= getFunctionSignature(method, typeDefs) %>
<% }); %>
});
`);
