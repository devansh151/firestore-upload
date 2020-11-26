const fetch = require('node-fetch');
const utils = require('../utils');
const config = require("../../yt-config/index.json");
const initFirebaseDB = require("../firebase");
const constants = require('../../constants');

const getAllVideos = () => {
  const filters = utils.prepareFilterQuery({channelId: config.channelIdArtists, playlistId: config.playlistId});
  const uri = utils.generateApiURL(filters, config.apiSubdomainPlaylistItems);
  console.log(uri);
  return fetch(uri)
    .then(response => response.json())
    .then(response => {
      if (response.error && constants.acceptableErrors.includes(response.error.code)) {
        throw new Error();
      }
      const formattedResponse = utils.formatYoutubeResponse(response);
      return initFirebaseDB(formattedResponse);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(new Error('something went wrong!!'));
    });
}

module.exports = getAllVideos;
