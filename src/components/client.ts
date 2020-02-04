import * as path from "path";
import { move } from "fs-extra";
import { IHooks } from "..";
import { readFile } from "fs-extra";
import * as fs from "fs";
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);
import TOML from "@iarna/toml";

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component) => {
      if (component.language === "typescript") {
        await move(path.join(dest, "_package.json"), path.join(dest, "package.json"));
      }
    },
  ],
  afterCompileTemplate: [
    async (dest, frm, component, openrpcDocument) => {
      if (component.language === "typescript") {
        const packagePath = path.join(dest, "package.json");
        const fileContents = await readFile(packagePath);
        const pkg = JSON.parse(fileContents.toString());
        const updatedPkg = JSON.stringify({
          ...pkg,
          name: component.name,
          version: openrpcDocument.info.version,
        });
        await writeFile(packagePath, updatedPkg);
      } else if (component.language === "rust") {
        const cargoTOMLPath = path.join(dest, "Cargo.toml");
        const fileContents = await readFile(cargoTOMLPath);
        const cargoTOML = TOML.parse(fileContents.toString());
        const updatedCargo = TOML.stringify({
          ...cargoTOML,
          package: {
            ...cargoTOML.package as object,
            name: component.name,
            version: openrpcDocument.info.version,
          },
        });
        await writeFile(cargoTOMLPath, updatedCargo);
      }
    },
  ],
};
