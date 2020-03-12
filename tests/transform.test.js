const request = require('supertest')
const binaryParser = require('superagent-binary-parser');
const app = require('../index')
const Qs = require('qs');
const Sharp = require('sharp');

const getTransform = (input, operations) => {
  const path = "/transform?" + Qs.stringify({ input, operations: JSON.stringify(operations) });

  return (
    request(app)
      .get(path)
      .parse(binaryParser)
      .buffer()
  );
}

describe('Transform Endpoint', () => {
  it('should not change anything', async () => {
    const res = await getTransform("https://via.placeholder.com/500")

    expect(res.statusCode).toEqual(200)

    const metadata = await Sharp(res.body).metadata();
    expect(metadata.format).toEqual('png')
    expect(metadata.width).toEqual(500)
    expect(metadata.height).toEqual(500)
  });

  it('should resize and format', async () => {
    const res = await getTransform(
      "https://via.placeholder.com/500",
      [
        { name: 'resize', params: [{ width: 200, height: 200 }] },
        { name: 'toFormat', params: [ 'jpeg' ] }
      ]
    );
    expect(res.statusCode).toEqual(200)

    const metadata = await Sharp(res.body).metadata();
    expect(metadata.format).toEqual('jpeg')
    expect(metadata.width).toEqual(200)
    expect(metadata.height).toEqual(200)
  });

  it('should follow operations order', async () => {
    const res = await getTransform(
      "https://via.placeholder.com/500",
      [
        { name: 'resize', params: [{ width: 200, height: 200 }] },
        { name: 'resize', params: [{ width: 100, height: 100 }] },
        { name: 'toFormat', params: [ 'jpeg' ] }
      ]
    );
    expect(res.statusCode).toEqual(200)

    const metadata = await Sharp(res.body).metadata();
    expect(metadata.format).toEqual('jpeg')
    expect(metadata.width).toEqual(100)
    expect(metadata.height).toEqual(100)
  });

  it('should be able to do a bunch of operations', async () => {
    const res = await getTransform(
      "https://via.placeholder.com/500",
      [
        { name: 'rotate', params: [ 45 ] },
        { name: 'resize', params: [{ width: 100, height: 100 }] },
        { name: 'recomb', params: [
          [
            [0.3588, 0.7044, 0.1368],
            [0.2990, 0.5870, 0.1140],
            [0.2392, 0.4696, 0.0912],
          ]
        ]},
        { name: 'rotate', params: [ 45 ] },
        { name: 'gamma', params: [ 3 ] },
        { name: 'negate', params: [] },
        { name: 'trim', params: [] },
        { name: 'toFormat', params: [ 'png' ] }
      ],
    );
    expect(res.statusCode).toEqual(200)

    const metadata = await Sharp(res.body).metadata();
    expect(metadata.format).toEqual('png')
    expect(metadata.width).toEqual(141)
    expect(metadata.height).toEqual(141)
  });

  it('should return error if uri is missing', async () => {
    const res = await getTransform(
      "",
      [{ resize: [{ width: 100, height: 100 }] }, { toFormat: [ 'jpeg' ] }],
    );
    expect(res.statusCode).toEqual(500)
  });

  it('should not crash on error', async () => {
    const res = await getTransform(
      "https://google.com",
      [{ resize: [{ width: 100, height: 100 }] }, { toFormat: [ 'jpeg' ] }],
    );
    expect(res.statusCode).toEqual(200)
  });
})

afterEach(() => app.close());
