module.exports = function chat() {

    let currentPromise = null;
    let currentPromiseResolve = null;

    function generateNewPromise() {
        currentPromiseResolve = null;
        currentPromise = new Promise(resolve => {
            currentPromiseResolve = resolve;
        });
    }

    function subscribe() {
        return currentPromise;
    }

    function publish(message) {

        if (!message) { return; }

        if (currentPromiseResolve != null) {
            currentPromiseResolve(message);
        }

        generateNewPromise();
    }

    generateNewPromise();

    return {
        subscribe: subscribe,
        publish: publish
    };

};