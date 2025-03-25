// Comprehensive Notification Permission Request
async function requestNotificationPermission() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification');
      return false;
    }
  
    // Check current permission status
    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }
  
    try {
      // More robust permission request with error handling
      const permission = await Notification.requestPermission();
      
      switch(permission) {
        case 'granted':
          console.log('Notification permission granted');
          return true;
        case 'denied':
          console.warn('Notification permission was denied');
          return false;
        case 'default':
          console.warn('Notification permission was dismissed');
          return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Example usage
  function setupNotifications() {
    // Check if browser supports notifications
    if ('Notification' in window) {
      // Trigger permission request on a user interaction (e.g., button click)
      const notifyButton = document.getElementById('notify-button');
      notifyButton.addEventListener('click', async () => {
        const permissionGranted = await requestNotificationPermission();
        
        if (permissionGranted) {
          // Send a test notification
          new Notification('Welcome!', {
            body: 'Notifications are now enabled',
            icon: '/path/to/your/icon.png' // Optional: Add an icon
          });
        }
      });
    }
  }
  
  // Additional Android-specific considerations
  function checkAndroidNotificationSupport() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      console.log('Running on Android device');
      
      // Check if service workers are supported (required for some mobile notification approaches)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered successfully');
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    }
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    setupNotifications();
    checkAndroidNotificationSupport();
  });

// service-worker.js
self.addEventListener('push', function(event) {
    const title = 'Notification Title';
    const options = {
      body: 'Notification body text',
      icon: '/path/to/icon.png'
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });











// async function requestNotification(){
//     alert("hi there")
//     await Notification.requestPermission()
// }
// const askNotificationPermision = async()=>{
//     const notRes = await Notification.requestPermission();
//     if(notRes === "granted"){
//         console.log("Notification permission is granted")
//     }else if(notRes === "denied"){
//         console.log("Notification permission is denied")
//     }else if(notRes === "default"){
//         console.log("Notification value is not set");
//     }
// }

// const username = "Ahemia"

// const notify =()=>{
//     const notification = new Notification(`${username} is in danger`,{
//         body:"please look the location of mine i am here",
//         icon:"https://static.vecteezy.com/system/resources/previews/004/526/847/non_2x/women-protection-rgb-color-icon-protect-girls-against-violence-female-empowerment-women-safety-gender-equality-provide-peace-and-security-isolated-illustration-simple-filled-line-drawing-vector.jpg",
//         vibrate:[200,100,200]
//     })

//     notification.addEventListener('click',()=>{
//         window.open("https://google.com")
//     })

//     setTimeout(()=>{
//         notification.close()
//     },5000)
// }

// if("Notification" in window){
//     console.log("you can use notification service")
//     if(Notification.permission === "granted"){
//         // setInterval(()=>{
//             notify();

//         // },2000)
//     }else{
//        askNotificationPermision()
//     }
// }
