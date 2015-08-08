var React = window.React = require('react'),
    reactRouter = require('react-router'),
    Route = reactRouter.Route,
    Router = reactRouter.Router,
    history = require('react-router/lib/BrowserHistory').history,
    mountNode = document.getElementById("app");

var Map = require('./ui/Map.jsx').Map,
    Panel = require('./ui/Panel.jsx'),
    Report = require('./ui/Report.jsx');

React.render((
    <Router history={history}>
        <Route path="/" component={Map}>
            <Route path="add" component={Panel}/>
            <Route path="reports/:reportId" component={Report}/>
        </Route>
    </Router>
    ), mountNode
);
