var reactRouter = require('react-router'),
    Link = reactRouter.Link;

var Panel = React.createClass({
    render: function () {
        return (
            <div className="panel panel-right">
                <Link to="/">close</Link>
            </div>
        );
    }
});

module.exports = Panel;
