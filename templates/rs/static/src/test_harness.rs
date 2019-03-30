use jsonrpc_client_core::Transport;
use futures::{Future, future::result};
use failure::{Error, err_msg, Compat};
use std::collections::HashMap;
use serde_json::Value;
use serde::{Serialize, Deserialize};

pub struct MockTransport {
    method: String,
    params: Vec<Value>,
    result: Value,
}

impl MockTransport {
    fn validate(&self, json_data: Vec<u8>) -> Result<Vec<u8>, Error> {
        #[derive(Deserialize, Debug)]
        struct RequestObject {
            method: String,
            params: Vec<Value>,
            id: i64,
        }

        #[derive(Serialize, Debug)]
        struct Response<T> {
            jsonrpc: &'static str,
            result: T,
            id: i64,
        }

        let json: RequestObject = serde_json::from_slice(&json_data)?;

        if json.method != self.method {
            return Err(err_msg(
                format!("'method' mismatch:\n\texpected {:?}\n\tgot {:?}", self.method, json.method)
            ))
        }

        if json.params != self.params {
            return Err(err_msg(
                format!("'params' mispatch:\n\texpected {:?}\n\tgot {:?}", self.params, json.params)
            ))
        }

        let response = Response {
            jsonrpc: "2.0",
            result: self.result.clone(),
            id: json.id,
        };

        Ok(serde_json::to_vec(&response)?)
    }
}

impl Transport for MockTransport {
    type Future = Box<Future<Item = Vec<u8>, Error = Self::Error> + Send>;
    type Error = Compat<Error>;

    fn get_next_id(&mut self) -> u64 {
        0
    }

    fn send(&self, json_data: Vec<u8>) -> Self::Future {
        Box::new(result(self.validate(json_data).map_err(|e| e.compat())))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Serialize, Deserialize};

    pub type PetId = String;
    pub type Pets = Vec<Pet>;

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    pub struct Pet {
        #[serde(rename = "id")]
        id: PetId,

        #[serde(rename = "name")]
        name: String,

        #[serde(rename = "tag")]
        tag: Option<String>,
    }

    jsonrpc_client!(pub struct PetStore {
        pub fn get_pet(&mut self, petId: PetId) -> RpcRequest<Pets>;
    });

    #[test]
    fn generated_test_sample() {
        //- method quety template start
        let method = "get_pet".into();
        //- method query template end

        //- params query template start
        let mut params= Vec::new();
        //-- loop over params (name, type) pairs start
        let petId_value = PetId::from("pet0"); // note: should be random, or queried from example, not manually set value
        params.push(serde_json::to_value(&petId_value).unwrap());
        //-- loop over params end
        //- params query template end

        //- result query template start
        // note: should be random, or queried from example, not manually set value
        let result = Pets::from(vec![
            Pet { id: PetId::from("pet0"), name: String::from("Fluffy"), tag: None }
        ]);
        //- result query template end

        let transport = MockTransport {
            method,
            params,
            result: serde_json::to_value(&result).unwrap(),
        };

        let mut client = PetStore::new(transport);
        let received_result = client.get_pet(
            //- loop over params start
            petId_value,
            //- loop over params end
        ).wait().unwrap();

        assert_eq!(result, received_result);
    }
}