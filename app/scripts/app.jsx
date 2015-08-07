var React = window.React = require('react'),
    reactRouter = require('react-router'),
    Link = reactRouter.Link,
    Route = reactRouter.Route,
    Router = reactRouter.Router,
    history = require('react-router/lib/BrowserHistory').history,
    mountNode = document.getElementById("app");

var Legend = require('./ui/Legend.jsx'),
    Panel = require('./ui/Panel.jsx');

var map = require('./map');

var Map = React.createClass({
    componentDidMount: function() {
        map.init('map');
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
