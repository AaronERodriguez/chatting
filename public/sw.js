self.addEventListener("push", (event) => {
    const title = data.title;
    const body = data.body;
    const icon = data.icon;
  
    const notificationOptions = {
      body: body,
      tag: "unique-tag", // Use a unique tag to prevent duplicate notifications
      icon: icon,
    };
  
    self.registration.showNotification(title, notificationOptions);
  });