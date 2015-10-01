import config from '../config/config';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var ratingsColumnsDownload = [
    'ST_AsEWKT(streets.the_geom) AS the_geom',
    'streets.stname_lab AS street',
    'ratings.collected',
    'ratings.rating'
];

export var ratingsColumnsMap = [
];

function where(filters, yearRange) {
    var whereConditions = [];
    var yearCondition = `extract(year from created_date) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
    var where = ` WHERE  ${yearCondition} AND (${whereConditions.join(' OR ')})`;
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

export function getRatingSql(filter, yearRange, columns = ratingsColumnsMap) {
    var sql = `SELECT ${columns} FROM ${config.tables.ratings} ratings LEFT JOIN ${config.tables.streets} ON ratings.segment_id = streets.cartodb_id`;
    if (filter || yearRange) {
        sql += ` ${where(filter, yearRange)}`;
    }
    return sql;
}
