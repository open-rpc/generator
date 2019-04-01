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
    use serde::{Serialize, Deserialize};
    use autorand::Random;

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
    <% getParamTypings(method, typeDefs).forEach((paramType) => { %>
        let <%= paramType + "_value" %> = <%= paramType + "::random()" %>;
        let serialized = serde_json::to_value(&<%= paramType + "_value" %>).unwrap();
        params.push(serialized);
    <% }); %>
        //-- loop over params end
        //- params query template end

        //- result query template start
        <% const resultType = typeDefs[generateMethodResultId(method, method.result)].typeName; %>
        let result = <%= resultType + "::random()" %>;
        //- result query template end

        let transport = MockTransport {
            method,
            params,
            result: serde_json::to_value(&result).unwrap(),
        };

        let mut client = PetStore::new(transport);
        let received_result = client.get_pet(
            //- loop over params start
        <% getParamTypings(method, typeDefs).forEach((paramType) => { %>
            <%= paramType + "_value" %>,
        <% }); %>
            //- loop over params end
        ).wait().unwrap();

        assert_eq!(result, received_result);
    }
<% }); %>
}
`);
