const getSchema = require('./get-schema');
jest.mock('fs-extra', () => ({
  readJson: jest.fn()
}));

const fs = require('fs-extra');

describe('get-schema', () => {
  beforeEach(() => {
    fs.readJson.mockResolvedValue({ methods: {} });
  });

  it('defaults to looking for openrc.json in cwd', async () => {
    expect.assertions(1);
    const schema = await getSchema();
    expect(fs.readJson).toHaveBeenCalledWith(`${process.cwd()}/openrpc.json`);
  });

  it('handles custom file path', async () => {
    expect.assertions(1);
    const schema = await getSchema('./node_modules/@open-rpc/examples/service-descriptions/petstore.json');
    expect(schema.methods).toBeDefined();
  });

  it('handles urls', async () => {
    const schema = await getSchema('https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json');
    expect(schema.methods).toBeDefined();
  });


  describe('errors', () => {
    it('rejects when unable to find file via default', () => {
      expect.assertions(1);
      fs.readJson.mockClear();
      fs.readJson.mockRejectedValue(new Error('cannot compute error'));
      return expect(getSchema()).rejects.toThrow('Unable to read');
    });

    it('rejects when unable to find file via custom path', () => {
      expect.assertions(1);
      fs.readJson.mockClear();
      fs.readJson.mockRejectedValue(new Error('cannot compute error'));
      return expect(getSchema('./not/a/real/path.json')).rejects.toThrow('Unable to read');
    });

    it('rejects when the url doesnt resolve to a schema', () => {
      expect.assertions(1);
      fs.readJson.mockClear();
      fs.readJson.mockRejectedValue(new Error('cannot compute error'));
      return expect(getSchema('https://google.com')).rejects.toThrow('Unable to download');
    });

    it('rejects when the schema cannot be dereferenced', () => {
      expect.assertions(1);
      fs.readJson.mockClear();
      fs.readJson.mockResolvedValue({
        methods: {
          foo: {
            parameters: [
              {
                name: 'bar',
                schema: { $ref: '#/components/bar' }
              }
            ]
          }
        }
      });
      return expect(getSchema()).rejects.toThrow('The json schema provided cannot be dereferenced');
    });

  });
});
