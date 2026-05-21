// Copy this file to config.js and fill in your values.
window.MIRROR_CONFIG = {
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
    // Default list: fish-data.js (115 fish). Override with your own array:
    // fish: [{ name: "...", fact: "..." }],
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
