import config from '../config/config';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var canColumnsData = [
    "'can' AS type",
    'cartodb_id',
    'type AS cantype'
];

export var canColumnsDetails = [
    'cartodb_id',
    'type',
    'ST_X(the_geom) AS longitude',
    'ST_Y(the_geom) AS latitude'
];

export var canColumnsMap = ['*'];

function where(filters) {
    var whereConditions = [];
    var where = ` WHERE ${whereConditions.join(' OR ')}`;
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

export function getCanSql(filters, columns = canColumnsMap) {
    var sql = `SELECT ${columns} FROM ${config.tables.can} `;
    if (filters) {
        sql += ` ${where(filters)}`;
    }
    return sql;
}

export function getCans(filters, callback, columns) {
    cartodbSql.execute(getCanSql(filters, columns))
        .done(function (data) {
            callback(data.rows);
        });
}
