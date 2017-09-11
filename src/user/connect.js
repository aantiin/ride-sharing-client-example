
const connect = (firebase) => {
    const uuid = 'zxcfghbj7ghaBG23fgSR';

    const listenDriverLocation = (orderNo) => {
        console.log(`${orderNo} listenDriverLocation`);
        const ref = firebase.database().ref(`orders/on-going/${uuid}/${orderNo}`);
        ref.on('value', (snapshot) => {
            const { driver, status } = snapshot.val() || {};

        if (driver != null && status !== 'REQUEST_DRIVER') {
            const { location, info } = driver || {};
            const { name } = info || {};

            console.log(`${status} order ${orderNo} driver ${name} location ${location.formattedAddress} ${location.lat} ${location.lng}`);
        }

    }, (error) => {
            ref.off();
            console.log(error);
        });
    };

    const setRequest = () => new Promise((resolve, reject) => {
        const ref = firebase.database().ref('event-queue/user/request-driver/request');
    const refResult = firebase.database().ref('event-queue/user/request-driver/result');

    const newKey = ref.push().key;

    const minLat = -6.236485;
    const maxLat = -6.254342;
    const minLng = 106.782623;
    const maxLng = 106.813444;

    const getRandom = (min, max) => (Math.random() * (max - min)) + min;

    console.log(`${uuid} request driver....`);
    ref.child(newKey).set({
        uuid,
        location: {
            lat: getRandom(minLat, maxLat),
            lng: getRandom(minLng, maxLng),
        }
    }).then(() => {
        refResult.child(newKey).on('value', (snapshot) => {
        const { onProgress, success, error, data } = snapshot.val() || {};
    if (onProgress != null && onProgress === false) {
        const { orderNo } = data || {};

        console.log(`${uuid} request driver ${success} ${orderNo} with error ${error}`);
        refResult.child(newKey).off();
        refResult.child(newKey).remove();

        console.log('RES ->>> ', snapshot.val())
        if (success === true) {
            // listen on
            listenDriverLocation(orderNo);
        }

        resolve();
    }
    return null;
}, error => reject(error));
}).catch(error => reject(error));
    return null;
});

    firebase.auth().signInAnonymously().then((result) => {
        const ref = firebase.database().ref('event-queue/user/connect/request');
    const refResult = firebase.database().ref('event-queue/user/connect/result');
    const newKey = ref.push().key;

    ref.child(newKey).set({
        uuid,
        location: {
            lat: -6.254705,
            lng: 106.813315
        }
    }).then(() => {
        refResult.child(newKey).on('value', (snapshot) => {
        const { onProgress, success, error } = snapshot.val() || {};
    if (onProgress != null && onProgress === false) {
        console.log(`${newKey} ${success} user ${uuid} connected-USER; with error ${error}`);
        refResult.child(newKey).off();
        refResult.child(newKey).remove();

        setTimeout(setRequest, 10000);
    }
}, (error) => {
        console.log(error);
    });
}).catch(error => console.log(error));
}).catch(error => console.log(error));
};
module.exports.connect = connect;
