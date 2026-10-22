/* Edit these paths when the files are ready. Keep them relative for GitHub Pages.
 * Example: aiodeskVideo: "assets/video/aiodesk-motion.mp4"
 * No file is requested while its setting is an empty string.
 */
window.PORTFOLIO_CONFIG = Object.freeze({
  aiodeskVideo: "assets/video/aiodesk-motion.mp4",
  aiodeskCaptions: "", // Optional WebVTT captions for a narrated film.
  cvUrl: "", // Example: "assets/Ali-Gholizadeh-CV.pdf"
  // Put your four screenshots at these paths, or change each src to its filename.
  projectGallery: [
    { src: "assets/aiodesk-dashboard.png", title: "Dashboard", description: "An overview of device activity and support operations." },
    { src: "assets/aiodesk-tickets.png", title: "Tickets", description: "Support requests, priorities, and ticket progress in one place." },
    { src: "assets/aiodesk-devices.png", title: "Devices", description: "Connected devices, inventory details, and online status." },
    { src: "assets/aiodesk-patch-management.png", title: "Patch management", description: "A view of the update-management workspace." }
  ]
});
