var React = window.React = require('react'),
    reactRouter = require('react-router'),
    Link = reactRouter.Link,
    Route = reactRouter.Route,
    Router = reactRouter.Router,
    history = require('react-router/lib/BrowserHistory').history,
    mountNode = document.getElementById("app");

var Legend = require('./ui/Legend.jsx'),
    Panel = require('./ui/Panel.jsx');

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

        map.setView([40.728,-73.95], 15);

        cartodb.createLayer(map, 'https://curbyourlitter.cartodb.com/api/v2/viz/4226a41e-3b85-11e5-8232-0e4fddd5de28/viz.json')
            .addTo(map);
    },

    render: function() {
        return (
            <div className="map" id="map">
                {this.props.children}
                <AddButton />
                <Legend />
            </div>
        );
    }
});

var AddButton = React.createClass({
    render: function() {
        return (
            <Link className="btn btn-add" to="/add">add</Link>
        );
    }
});

React.render((
    <Router history={history}>
        <Route path="/" component={Map}>
            <Route path="add" component={Panel}/>
        </Route>
    </Router>
    ), mountNode
);
