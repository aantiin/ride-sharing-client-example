
const connect = (firebase, uuid) => {



    const sendPresence = () => new Promise((resolve, reject) => {
        const ref = firebase.database().ref('event-queue/driver/presence/request');
    const refResult = firebase.database().ref('event-queue/driver/presence/result');

    const newKey = ref.push().key;

    const minLat = -6.236485;
    const maxLat = -6.254342;
    const minLng = 106.782623;
    const maxLng = 106.813444;

    const getRandom = (min, max) => (Math.random() * (max - min)) + min;

    ref.child(newKey).set({
        uuid,
        location: {
            lat: getRandom(minLat, maxLat),
            lng: getRandom(minLng, maxLng),
        }
    }).then(() => {
        refResult.child(newKey).on('value', (snapshot) => {
        const { onProgress, success, error } = snapshot.val() || {};
    if (onProgress != null && onProgress === false) {
        console.log(`${success} send presence-DRIVER; with error -> ${error}`);
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
            sendPresence().then(() => {
                i += 1;
            setTimeout(() => { sendPresenceRecursive(i); }, 500);
        }).catch((error) => {
                console.log(error);
        });
        }
    };

    const pickUpOrder = (order) => {
        console.log(`${uuid} try to pick up order...`);
        const request = firebase.database().ref('event-queue/driver/pickup/request');
        const pushId = ref.push().key;
        const result = firebase.database().ref('event-queue/driver/pickup/result');

        request.child(pushId).set({
            uuid,
            order
        }).then(() => {
            result.child(pushId).on('value', (snapshot) => {
            const { onProgress, success, error } = snapshot.val() || {};
        if (onProgress != null && onProgress === false) {
            console.log(`${success} pickup - ${uuid} with error -> ${error}`);
            result.child(pushId).off();
            result.child(pushId).remove();

            // TODO
            if (success === true) {
                sendPresenceRecursive(0);
            }
        }
    }, (error) => {
            console.log(error);
        });
    }).catch(error => console.log(error));
    };

    const waitingOrder = () => {
        const readyRef = firebase.database().ref(`drivers-ready/${uuid}`);

        console.log(`${uuid} waiting order...`);
        readyRef.on('value', (snapshot) => {
            const { request } = snapshot.val() || {};

        setTimeout(() => {
            if (request) {
                console.log(`${uuid} order masuk ---> ${Object.keys(request).length}`);
                const orders = [];
                Object.keys(request).map(key => orders.push(request[key]));

                setTimeout(() => {
                    pickUpOrder(orders[0]);
            }, 2000);
            }
        }, 1000);
    }, (error) => {
            console.log(error);
        });
    };

    firebase.auth().signInAnonymously().then((result) => {
        const ref = firebase.database().ref('event-queue/driver/connect/request');
    const newKey = ref.push().key;
    const refResult = firebase.database().ref('event-queue/driver/connect/result');

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
        console.log(`${success} conected - ${uuid} with error -> ${error}`);
        refResult.child(newKey).off();
        refResult.child(newKey).remove();


        waitingOrder();
    }
}, (error) => {
        console.log(error);
    });
}).catch(error => console.log(error));
}).catch(error => console.log(error));
};

module.exports.connect = connect;
