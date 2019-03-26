import { template } from "lodash";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;

extern crate serde;
extern crate serde_json;

#[macro_use]
extern crate serde_derive;

<%= _.chain(typeDefs).values().uniqBy("typeName").map("typing").value().join("") %>

jsonrpc_client!(pub struct <%= className %> {
<% methods.forEach((method) => { %>
    <%= getFunctionSignature(method, typeDefs) %>
<% }); %>
});
`);
