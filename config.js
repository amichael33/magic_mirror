// Your live settings — edit this file (see config.example.js for all options).
window.MIRROR_CONFIG = {
  // "portrait" = mirror hung vertically (Pi rotated → 1080×1920)
  orientation: "portrait",

  timezone: "America/Chicago",

  weather: {
    enabled: true,
    locationLabel: "Houston, TX",
    city: "Houston",
    country: "US",
    latitude: 29.7604,
    longitude: -95.3698,
    units: "imperial",
  },

  credit: {
    enabled: true,
    text: "made by girls who code club '26",
  },

  fishOfTheDay: {
    enabled: true,
  },

  greeting: {
    enabled: true,
    morningHour: 5,
    eveningHour: 17,
    nightHour: 22,
    name: "",
  },

  weatherRefreshMinutes: 15,
};
