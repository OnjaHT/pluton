// console.log('Service worker', this);

var CACHE_VERSION = '1.0';

/**
 * 
 * 
 * @since 1.0.0
 */
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
        .then(function(cache) {
            return cache.addAll([
                '/pluton/css/animate.css'
            ]);
        })
    );
});


/**
 * 
 * 
 * @since 1.0.0
 */
self.addEventListener('activate', function(event) {
    event.waitUntil(
        //Lors de l'activation service, on supprime les anciens caches
        caches.keys()
        .then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName != CACHE_VERSION
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});


/**
 * Déclenché lorsque la page veut accéder à une ressource
 * 
 * @since 1.0.0
 */
self.addEventListener('fetch', function(event) {
    let request = event.request;

    if ( request.method !== 'GET' ) {
        return;
    }

    event.respondWith(
        //Retourne l'objet en cache
        caches.match(request)
        .then(function(response) {
            
            if ( response !== undefined ) {
                // console.log('FETCH > Ressource en cache => ', request.url );
                return response;
            }

            //Recupere l'objet depuis son URL
            return fetch(request)
            .then(function(response) { //Si pas d'erreur 
                let responseClone = response.clone();

                caches.open(CACHE_VERSION) //On ouvre le cache
                .then(function(cache) {
                    cache.put(request, responseClone); //On l'ajoute au cache
                })
                .catch(function() {
                    console.log('FETCH > Error open cache');
                });
            })
            .catch(function() { //Si la resource n'est pas accessible
                // console.log('FETCH > Error 404 => ', request);
                return Response.error();
            });
        })
    );
});


/**
 * Déclenché lorsque le worker reçoit un message
 * 
 * @since 1.0.0
 */
self.addEventListener('message', function(e) {
    console.log('On SW message: ', e.data);

    // clients.matchAll({
    //     type: 'window'
    // })
    // .then(function(clientList) {
    //     console.log('Client List,', clientList);
    //     clientList.forEach(function(client) {
    //         client.postMessage('Hello from WS');
    //     });
    // });
});

/**
 * 
 * 
 * @since 1.0.0
 */
self.addEventListener('push', function(event) {
    console.log('SW on Push ===>', event);
    event.waitUntil(
        self.registration.showNotification('Pluton notification', {
            body: 'Une notification push a été lancé',
            icon: './images/ico/icon-48.png',
            tag: 'pluton-notification',
            vibrate: [500, 300],
        })
    );
});


/**
 * Evénément déclenché lors du click sur une notification
 * 
 * @since 1.0.0
 */
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    })
    .then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url == '/' && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    }));
});