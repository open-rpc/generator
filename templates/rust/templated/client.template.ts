import { template } from "lodash";
import { OpenRPCTypingsSupportedLanguages } from "@open-rpc/typings";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;
use serde::{Serialize, Deserialize};

#[cfg(test)]
use autorand::Random;

#[cfg(test)]
mod test_harness;

<%= methodTypings.toString("rust", { includeSchemaTypings: true, includeMethodAliasTypings: false }) %>

jsonrpc_client!(pub struct <%= className %> {
  <%= methodTypings.toString("rust", { includeSchemaTypings: false, includeMethodAliasTypings: true }) %>
});

#[cfg(test)]
mod tests {
    use super::*;
    use test_harness::*;
    use autorand::Random;
    use futures::Future;

<% openrpcDocument.methods.forEach((method) => { %>
  <% var typeNames = methodTypings.getTypingNames("rust", method); %>
    #[test]
    #[allow(non_snake_case)]
    fn <%= method.name %>_test () {
        let method = "<%= method.name %>".into();

        let mut params = Vec::new();
  <% typeNames.params.forEach((paramTypeName) => { const paramName = paramTypeName + "_value" %>
        let <%= paramName %> = <%= paramTypeName %>::random();
        let serialized = serde_json::to_value(&<%= paramName %>).unwrap();
        params.push(serialized);
  <% }); %>
        let result = <%= typeNames.result %>::random();
        let result_serialized = serde_json::to_vec(&result).unwrap();
        let result: <%= typeNames.result %> = serde_json::from_slice(&result_serialized).unwrap();

        let transport = MockTransport {
            method,
            params,
            result: serde_json::to_value(&result).unwrap(),
        };

        let mut client = <%= className %>::new(transport);
        let received_result = client.<%= method.name %>(
          <%= typeNames.params.map((n) => n + "_value").join(", ") %>
        ).wait().unwrap();

        let result_s =
        assert_eq!(result, received_result);
    }
<% }); %>
}
`);
