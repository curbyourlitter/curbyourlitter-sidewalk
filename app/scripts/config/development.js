var config = {};

config.apiBase = 'http://localhost:8000';

config.tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 11,
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

export default config;
