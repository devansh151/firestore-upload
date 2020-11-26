const lodash = require("lodash");
const utils = require("../utils");
const constants = require("../../constants");

const DB = {
  "allVideos": [],
	"artists": {},
	"genres": {},
	"latest": []
};

const createTable = (bucket, tableName) => {
	if(!DB[bucket][tableName]) {
    DB[bucket][tableName] = [];
  }
}

const insertIntoTable = (bucket, tableName, dataRow) => {
	if(!DB[bucket][tableName]) {
    createTable(bucket, tableName);
  }
  DB[bucket][tableName].push(dataRow);
};

const descriptionParser = (desc) => {
	if(desc && desc.trim() !== "") {
    const descriptionObj = {};
    desc.split("\n").forEach((keyValue) => {
      const key = keyValue.split(": ")[0];
      const value = keyValue.split(": ")[1];
      descriptionObj[key] = value;
    });
    return descriptionObj;
  }
  return null;
}

const fillTable = (tableName, key, video) => {
  const description = descriptionParser(video.description);
  if (description[key]) {
    const values = description[key].split(", ");
    values.forEach((val) => {
      insertIntoTable(tableName, val, video);
    });
  }
};

const initFirebaseDB = (response) => {
  response.forEach((video) => {
    fillTable("artists", "Artist", video);
    fillTable("genres", "Tags", video);
  });
  let latestVideos = lodash.sortBy(response, (o)=> o.publishedAt);
  latestVideos.length = constants.LATEST_VIDEOS_LIMIT;
  DB["allVideos"] = response;
  DB["artists"]= utils.formatAlbumListResponse(DB["artists"]);
  DB["genres"]= utils.formatAlbumListResponse(DB["genres"]);
  DB["latest"]= utils.formatTrackListResponse(latestVideos);
  return DB;
};

module.exports = initFirebaseDB;