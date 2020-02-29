/* eslint-disable no-console */
const request = require('request');

module.exports = {
  getFaceInfo: (url) => {
    const uriBase = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect';
    const params = {
      returnFaceId: 'false',
      returnFaceLandmarks: 'true',
      returnFaceAttributes: '',
    };
    const options = {
      uri: uriBase,
      qs: params,
      body: `{"url": "${url}"}`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.SUB_KEY,
      },
    };
    return new Promise((resolve) => {
      request.post(options, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          return;
        }
        resolve(JSON.parse(body), null, '  ');
      });
    });
  },
};
