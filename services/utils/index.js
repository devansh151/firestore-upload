const config = require("../../yt-config/index.json");

const {apiDomain, apiKey, maxResults} = config;

const generateApiURL = (params, subdomain) => {
  const spreadParams = objectToQueryParams(params);
  return `${apiDomain}${subdomain}?key=${apiKey}&maxResults=${maxResults}&${spreadParams}`;
};

const objectToQueryParams = obj => {
  return Object.entries(obj)
    .map(
      ([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`,
    )
    .join('&');
};

const formatTrackListResponse = data => {
  try {
    let artistsMap = {};
    const albumResponse = {
      totalTracks: data.length || 0,
      trackList: [],
    };
    data.forEach(item => {
      const trackInfo = prepareTrackInfo(item.description);
      artistsMap = {...artistsMap, ...prepareArtistsMap(trackInfo)};
      albumResponse.trackList.push({
        videoId: item.videoId,
        trackName: item.title,
        thumbnail: item.thumbnail,
        trackInfo: trackInfo,
      });
    });
    albumResponse.totalArtists = Object.keys(artistsMap).length;
    return albumResponse;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const formatAlbumListResponse = data => {
  try {
    const playlistResponse = {
      totalAlbums: Object.keys(data).length || 0,
      albumList: [],
    };
    for (const [key, value] of Object.entries(data)) {
      const trackList = formatTrackListResponse(value);
      playlistResponse.albumList.push({
        albumName: key,
        albumId: key,
        thumbnail: value.length && value[0].thumbnail,
        ...trackList
      });
    }
    return playlistResponse;
  } catch (error) {
    return error;
  }
};

const prepareFilterQuery = filters => {
  const commonFilters = {
    part: 'snippet',
    type: 'video',
  };
  return {...commonFilters, ...filters};
};

const trimString = string => {
  if (string.length > 14) {
    return string.substring(0, 14) + '..';
  }
  return string;
};

const formatAlbumName = string => {
  return string.split(' | ')[0];
};

const prepareTrackInfo = description => {
  const infos = description.split('\n');
  const trackMeta = {};
  infos.forEach(item => {
    trackMeta[item.split(':')[0]] = item.split(':')[1];
  });
  return trackMeta;
};

const shuffleArray = data => {
  let j, x, i;
  for (i = data.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = data[i];
    data[i] = data[j];
    data[j] = x;
  }
  return data;
};

const prepareArtistsMap = trackInfo => {
  const artistsMap = {};
  trackInfo.Artist.split(',').forEach(item => {
    artistsMap[item.trim()] = item.trim();
  });
  return artistsMap;
};

const getTodaysStartingDate = () => {
  return moment()
    .startOf('day')
    .format();
};

const formatYoutubeResponse = (response) => { 
  return response.items.map(({snippet}) => {
    const {publishedAt, title, description, thumbnails, resourceId} = snippet;
    return {
      publishedAt,
      title,
      description,
      thumbnail: thumbnails.high.url,
      videoId: resourceId.videoId
    };
  });
};

module.exports = {
  formatYoutubeResponse,
  getTodaysStartingDate,
  shuffleArray,
  prepareTrackInfo,
  formatAlbumName,
  trimString,
  prepareFilterQuery,
  formatAlbumListResponse,
  formatTrackListResponse,
  objectToQueryParams,
  generateApiURL
}