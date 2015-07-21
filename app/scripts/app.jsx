var React = window.React = require('react'),
    reactRouter = require('react-router'),
    Link = reactRouter.Link,
    Route = reactRouter.Route,
    Router = reactRouter.Router,
    history = require('react-router/lib/HashHistory').history,
    Panel = require('./ui/Panel.jsx'),
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
                {this.props.children}
                <AddButton />
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
