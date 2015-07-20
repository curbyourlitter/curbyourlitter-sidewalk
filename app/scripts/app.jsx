var React = window.React = require('react'),
    Panel = require('./ui/Panel'),
    mountNode = document.getElementById("app");


var Map = React.createClass({
    componentDidMount: function() {
        this.initializeMap();
    },

    initializeMap: function () {
        var map = L.map('map');

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 11,
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.setView([40.733958, -73.955326], 15);
    },

    render: function() {
        return (
            <div className="map" id="map">
                <Panel />
            </div>
        );
    }
});


React.render(<Map />, mountNode);
