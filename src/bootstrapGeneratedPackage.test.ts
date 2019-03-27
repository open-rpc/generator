import _bootstrapGeneratedPackage from "./bootstrapGeneratedPackage";

it("rejects if there is an error", async () => {
  const bootstrapGeneratedPackage = _bootstrapGeneratedPackage(
    jest.fn((a, cb) => cb(new Error(), "blahblah")),
  );
  return expect(bootstrapGeneratedPackage("foobar", "typescript"))
    .rejects
    .toEqual(new Error("blahblah"));
});
