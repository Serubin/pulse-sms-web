
export default class Notifications {
    static getNotification() {
        const notification = window.Notification;
        return notification ? notification : {};
    }

    static needsPermission() {
        const notification = Notifications.getNotification();
        return (notification && notification.permission && notification.permission === 'granted') ? false : true;
    }

    static requestPermission() {
        return new Promise((reject, resolve) => {
            if (!Notifications.needsPermission())
                return resolve();

            // Return promise
            return Notification.getNotification().requestPermission().then(perm => {
                if (perm === 'granted')
                    return resolve();
                else if (perm === 'denied')
                    return reject();
            });
        });
    }

    static notify (title, options) {
        const notification = Notifications.getNotification();
        return new notification(title, options);
    }
}
