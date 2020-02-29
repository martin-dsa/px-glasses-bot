/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const Jimp = require('jimp');

const getData = (face) => {
  const f = face.faceLandmarks;
  const xLen = f.eyeRightOuter.x - f.eyeLeftOuter.x;
  const yLen = f.eyeLeftOuter.y - f.eyeRightOuter.y;
  return {
    width: Math.sqrt(xLen * xLen + yLen * yLen) * 1.5,
    angle: Math.atan(yLen / xLen) / Math.PI * 180,
  };
};

const transform = (width, angle) => new Promise((resolve) => {
  resolve(
    Jimp
      .read(process.env.GLASSES_URL)
      .then(glasses => glasses
        .rotate(angle)
        .resize(width, Jimp.AUTO)
        .getBufferAsync(Jimp.MIME_PNG)),
  );
});

module.exports = {
  getLargestPhoto: photos => new Promise((resolve) => {
    const largest = photos.reduce(
      (prev, cur) => ((prev.width * prev.height > cur.width * cur.height) ? prev : cur),
    );
    resolve(largest.file_id);
  }),
  buffers: faces => new Promise(async (resolve) => {
    const glassesBuffers = [];
    for (const face of faces) {
      const faceData = getData(face);
      await transform(faceData.width, faceData.angle)
        .then((buff) => {
          glassesBuffers.push({
            buffer: buff,
            x: face.faceLandmarks.eyeLeftOuter.x - faceData.width / 7,
            y:
              (face.faceLandmarks.eyeLeftTop.y < face.faceLandmarks.eyeRightTop.y)
                ? face.faceLandmarks.eyeLeftTop.y - faceData.width / 14
                : face.faceLandmarks.eyeRightTop.y - faceData.width / 14,
          });
        });
    }
    resolve(glassesBuffers);
  }),


  add: (picture, glasses) => new Promise((resolve) => {
    Jimp
      .read(picture)
      .then(async (image) => {
        for (const g of glasses) {
          await Jimp
            .read(g.buffer)
            .then((gl) => {
              image.composite(gl, g.x, g.y);
            });
        }
        resolve(image.getBufferAsync(Jimp.MIME_JPEG));
      });
  }),
};
