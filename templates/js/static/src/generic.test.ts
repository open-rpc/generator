import * as generated from './test';

console.log(generated);

describe('the generated lib', () => {
  it('can be imported', async () => {
    console.log('oopooh shiet');
    expect(typeof generated).toBe('function');

    const instance = new generated({ transport: { type: 'http' } });

    expect(instance).toBeInstanceOf(generated);

    const requestStub = jest.fn();
    jayson.client.http.mockReturnValue({
      request: requestStub
    });

    const result = await instance.get_pet();
    console.log(result);
  });
});
