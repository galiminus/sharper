const Sharp = require('sharp');
const Request = require('request');
const Express = require('express');

const AUTHORIZED_OPERATIONS = [
  "resize",
  "extend",
  "extract",
  "trim",
  "rotate",
  "flip",
  "flop",
  "sharpen",
  "median",
  "blur",
  "flatten",
  "gamma",
  "negate",
  "normalize",
  "convolve",
  "threshold",
  "boolean",
  "linear",
  "recomb",
  "modulate",
  "tint",
  "greyscale",
  "grayscale",
  "toColourSpace",
  "toColorSpace",
  "removeAlpha",
  "ensureAlpha",
  "extractChannel",
  "joinChannel",
  "bandbool",
  "toFormat",
  "withMetadata"
];

const app = Express()
  .get('/transform', ({ query: { input, operations = '[]' }}, res) => {
    const pipeline = Sharp();
    pipeline.pipe(res);

    for ({ name, params } of JSON.parse(operations))
      if (AUTHORIZED_OPERATIONS.indexOf(name) >= 0) pipeline[name](...params);

    Request.get(input).pipe(pipeline);
  })
  .listen(process.env.PORT || 3000);

module.exports = app;