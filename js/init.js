if ('serviceWorker' in navigator) {
    //Enregistrement et lancement du service Worker
    navigator.serviceWorker.register( 
        '/pluton/service-worker.js'/*?v=' + Date.now()*/, 
        { 
            scope: '/pluton/' 
        }
    ).then(function(serviceWorkerRegistration) {

        subscribeToPush();

    }).catch(function(error) {
        // registration failed
        console.log('Registration failed with ' + error);
    });

    /**
     * Enregistre les service worker au Push
     * 
     * @since 1.0.0
     */
    function subscribeToPush() {
        navigator.serviceWorker.ready
        .then(function(serviceWorkerRegistration) {
            //Retourne la subscription existant si existe
            return serviceWorkerRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                if ( subscription ) {
                    console.log('Déjà inscrit au Push : ', subscription);
                    return subscription;
                }

                console.log('Pas encore inscrit au Push');
                // Demande d'inscription au Push Server
                return serviceWorkerRegistration.pushManager.subscribe({ 
                    userVisibleOnly: true 
                });
            });
        }).then(function(subscription) {
            //sauvegarde de l'inscription dans sur le serveur (serveur du site)
            // fetch(ROOT_URL + '/register-to-notification', {
            //     method: 'post',
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json'
            //     },
            //     credentials: 'same-origin',
            //     body: JSON.stringify(subscription)
            // })
            // .then(function(response) {
            //     return response.json();
            // }).catch(function (err) {
            //     console.log('Could not register subscription into app server', err);
            // });
        })
        .catch(function(subscriptionErr) {
            // Check for a permission prompt issue
            console.log('Subscription failed ', subscriptionErr);
        });
    }
}