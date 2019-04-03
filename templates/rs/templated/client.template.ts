import { template } from "lodash";

export default template(`
#[macro_use]
extern crate jsonrpc_client_core;
use serde::{Serialize, Deserialize};

#[cfg(test)]
use autorand::Random;

#[cfg(test)]
mod test_harness;

<%= _.chain(typeDefs).values().uniqBy("typeName").map("typing").value().join("") %>

jsonrpc_client!(pub struct <%= className %> {
<% methods.forEach((method) => { %>
    <%= getFunctionSignature(method, typeDefs) %>
<% }); %>
});

#[cfg(test)]
mod tests {
    use super::*;
    use test_harness::*;
    use autorand::Random;
    use futures::Future;

<% methods.forEach((method) => { %>
    #[test]
    #[allow(non_snake_case)]
    fn <%= method.name + "_test" %> () {
        //- method quety template start
        let method = <%= '"' + method.name + '"' %>.into();
        //- method query template end

        //- params query template start
        let mut params = Vec::new();
        //-- loop over params (name, type) pairs start
    <% getParams(method, typeDefs).forEach((param) => { %>
        <% const paramName = param[0] + "_value" %>
        let <%= paramName %> = <%= param[1] + "::random()" %>;
        let serialized = serde_json::to_value(&<%= paramName %>).unwrap();
        params.push(serialized);
    <% }); %>
        //-- loop over params end
        //- params query template end

        //- result query template start
        <% const resultType = typeDefs[generateMethodResultId(method, method.result)].typeName; %>
        let result = <%= resultType + "::random()" %>;
        // transcode result to workaround Some(Null) -> Null serialization detail loss
        let result_serialized = serde_json::to_vec(&result).unwrap();
        let result: <%= resultType %> = serde_json::from_slice(&result_serialized).unwrap(); 
        //- result query template end

        let transport = MockTransport {
            method,
            params,
            result: serde_json::to_value(&result).unwrap(),
        };

        let mut client = <%= className + "::new(transport);" %>
        let received_result = client.<%= method.name %>(
            //- loop over params start
        <% getParams(method, typeDefs).forEach((param) => { %>
            <%= param[0] + "_value" %>,
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
