var config = {};

config.apiBase = 'http://data.curbyourlitter.org';

config.tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 11,
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

export default config;
