import { template } from "lodash";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;
use serde::{Serialize, Deserialize};

#[cfg(test)]
use autorand::Random;

#[cfg(test)]
mod test_harness;

<%= methodTypings.getAllUniqueTypings("rust") %>

jsonrpc_client!(pub struct <%= className %> {
<% openrpcDocument.methods.forEach((method) => { %>
<%= methodTypings.getFunctionSignature(method, "rust") %>
<% }); %>
});

#[cfg(test)]
mod tests {
    use super::*;
    use test_harness::*;
    use autorand::Random;
    use futures::Future;

<% openrpcDocument.methods.forEach((method) => { %>
    #[test]
    #[allow(non_snake_case)]
    fn <%= method.name + "_test" %> () {
        //- method quety template start
        let method = <%= '"' + method.name + '"' %>.into();
        //- method query template end

        //- params query template start
        let mut params = Vec::new();
        //-- loop over params start
    <% const typingsForMethod = methodTypings.getTypingsForMethod(method, "rust") %>
    <% typingsForMethod.params.forEach((param) => { %>
        <% const paramName = param.typeName + "_value" %>
        let <%= paramName %> = <%= param.typeName + "::random()" %>;
        let serialized = serde_json::to_value(&<%= paramName %>).unwrap();
        params.push(serialized);
    <% }); %>
        //-- loop over params end
        //- params query template end

        //- result query template start
        let result = <%= typingsForMethod.result.typeName + "::random()" %>;
        // transcode result to workaround Some(Null) -> Null serialization detail loss
        let result_serialized = serde_json::to_vec(&result).unwrap();
        let result: <%= typingsForMethod.result.typeName %> = serde_json::from_slice(&result_serialized).unwrap();
        //- result query template end

        let transport = MockTransport {
            method,
            params,
            result: serde_json::to_value(&result).unwrap(),
        };

        let mut client = <%= className + "::new(transport);" %>
        let received_result = client.<%= method.name %>(
            //- loop over params start
        <% typingsForMethod.params.forEach((param) => { %>
            <%= param.typeName + "_value" %>,
        <% }); %>
            //- loop over params end
        ).wait().unwrap();

        // transcode result to workaround Some(Null) -> Null serialization detail loss
        let result_s =
        assert_eq!(result, received_result);
    }
<% }); %>
}
`);
