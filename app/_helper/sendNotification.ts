const sendNotification = (title: string, options: {body: string, icon: string | undefined}): void => {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        })
    }
}

export default sendNotification