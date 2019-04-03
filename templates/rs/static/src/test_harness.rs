use jsonrpc_client_core::Transport;
use futures::{Future, future::result};
use failure::{Error, err_msg, Compat};
use std::collections::HashMap;
use serde_json::Value;
use serde::{Serialize, Deserialize};

pub struct MockTransport {
    pub method: String,
    pub params: Vec<Value>,
    pub result: Value,
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