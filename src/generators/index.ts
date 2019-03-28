import typescript from "./typescript";
import rust from "./rust";
import { IGenerator } from "./generator-interface";

interface IGenerators {
  typescript: IGenerator;
  rust: IGenerator;
  [key: string]: IGenerator;
}

const generators: IGenerators = {
  rust,
  typescript,
};

export default generators;
