// Imports
const getAllVideos = require("./services/api");
const firestoreService = require('firestore-export-import');
const firebaseConfig = require('./config.js');
const serviceAccount = require('./service-account.json');

// JSON To Firestore
const jsonToFirestore = async () => {
  try {
    const response = await getAllVideos();
    const DB = {
      "artistsData": {
        "artists": response.artists
      },
      "recentData": {
        "latest": response.latest
      },
      "moodData": {
        "genres": response.genres
      },
      "allVideosData": response.allVideos
    };
    console.log('Initialzing Firebase');
    await firestoreService.initializeApp(serviceAccount, firebaseConfig.databaseURL);
    console.log('Firebase Initialized');
    //console.log(JSON.stringify(response));
    await firestoreService.restore(DB);
  }
  catch (error) {
    console.log(error);
  }
};

jsonToFirestore();