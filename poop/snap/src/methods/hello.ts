import { Hello } from "../generated-typings";

const hello: Hello = () => {
  return Promise.resolve("string");
};

export default hello;
