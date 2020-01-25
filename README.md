# Sharper

A very simple Node, Express and [Sharp](https://sharp.pixelplumbing.com/) based image processing server.

## API

```
GET /transform?input=[uri]&operations=[JSON list of operations to perform]
```

The API is not as simple as setting `width` and `height` like most other API, Sharper is a straightforward layer around Sharp so the API very much minic the Sharp parameters. To ensure type safety and nesting operations must be serialized with JSON. For example:

```
const operations = JSON.stringify(
  [
    { name: 'rotate', params: [45] },
    { name: 'resize', params: [400, 400] },
    { name: 'toFormat', params: ['jpeg'] }
  ]
);
```



