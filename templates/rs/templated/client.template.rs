#[macro_use]
extern crate jsonrpc_client_core;
extern crate jsonrpc_client_http;

use jsonrpc_client_http::HttpTransport;

jsonrpc_client!(pub struct FizzBuzzClient {
    /// Returns the fizz-buzz string for the given number.
    pub fn fizz_buzz(&mut self, number: u64) -> RpcRequest<String>;
});

fn main() {
    let transport = HttpTransport::new().standalone().unwrap();
    let transport_handle = transport
        .handle("http://api.fizzbuzzexample.org/rpc/")
        .unwrap();
    let mut client = FizzBuzzClient::new(transport_handle);
    let result1 = client.fizz_buzz(3).call().unwrap();
    let result2 = client.fizz_buzz(4).call().unwrap();
    let result3 = client.fizz_buzz(5).call().unwrap();

    // Should print "fizz 4 buzz" if the server implemented the service correctly
    println!("{} {} {}", result1, result2, result3);
}
