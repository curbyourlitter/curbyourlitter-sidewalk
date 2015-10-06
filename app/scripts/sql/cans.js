import config from '../config/config';
import { fromCenterOfBBox, inBBox } from './bbox';

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
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            return null;
        })
        .filter(function (value) { return value !== null; })
        .value();
    var where = '';
    if (whereConditions.length !== 0) {
        where = ` WHERE ${whereConditions.join(' OR ')}`;
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
    var bboxColumns = _.clone(columns);
    if (filters.bbox) {
        bboxColumns.push(`${inBBox(filters.bbox)} AS in_bbox`);
        bboxColumns.push(`${fromCenterOfBBox(filters.bbox)} AS center_distance`);
    }
    cartodbSql.execute(getCanSql(filters, bboxColumns))
        .done(function (data) {
            callback(data.rows);
        });
}
