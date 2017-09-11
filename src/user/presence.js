const firebase = require('firebase');

const config = {
    apiKey: 'AIzaSyBwi2hErFCTyVKytkg2WG4FAc6eol9vUFo',
    authDomain: 'ride-sharing-example.firebaseapp.com',
    databaseURL: 'https://ride-sharing-example.firebaseio.com',
    projectId: 'ride-sharing-example'
};
firebase.initializeApp(config);

const ref = firebase.database().ref('event-queue/user/presence/request');
const refResult = firebase.database().ref('event-queue/user/presence/result');

const newKey = ref.push().key;

const minLat = -6.236485;
const maxLat = -6.254342;
const minLng = 106.782623;
const maxLng = 106.813444;

const getRandom = (min, max) => (Math.random() * (max - min)) + min;

const setRequest = () => new Promise((resolve, reject) => {
    ref.child(newKey).set({
    uuid: 'zxcfghbj7ghaBG23fgSR',
    location: {
        lat: getRandom(minLat, maxLat),
        lng: getRandom(minLng, maxLng),
    }
}).then(() => {
    refResult.child(newKey).on('value', (snapshot) => {
    const { onProgress, success, error } = snapshot.val() || {};
if (onProgress != null && onProgress === false) {
    console.log(`${success} send presence-USER; with error -> ${error}`);
    refResult.child(newKey).off();
    refResult.child(newKey).remove();
    return resolve();
}
return null;
}, error => reject(error));
}).catch(error => reject(error));
return null;
});

const sendPresenceRecursive = (i) => {
    if (i < 10) {
        setRequest().then(() => {
            i += 1;
        setTimeout(() => { sendPresenceRecursive(i); }, 500);
    }).catch((error) => {
            console.log(error);
    });
    }
};


firebase.auth().signInAnonymously().then((result) => {
    const i = 0;
sendPresenceRecursive(i);
}).catch(error => console.log(error));
