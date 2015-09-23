import config from '../config/config';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var requestColumnsData = [
    "'request' AS type",
    'cartodb_id',
    'can_type',
    `(added AT TIME ZONE '${config.timezone}')::text AS date`
];

export var requestColumnsMap = [
    '*',
    `(added AT TIME ZONE '${config.timezone}')::text AS date`
];

function where(filters, yearRange) {
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            switch(key) {
                case 'bigbelly':
                    if (value) {
                        return "can_type = 'bigbelly'";
                    }
                    break;
                case 'litter':
                    if (value) {
                        return "can_type = 'trash'";
                    }
                    break;
                case 'recycling':
                    if (value) {
                        return "can_type = 'recycling'";
                    }
                    break;
                case 'sightings':
                    if (value) {
                        return 'can_type IS NULL';
                    }
                    break;
            }
            return null;
        })
        .filter(function (value) { return value !== null; })
        .value();
    var yearCondition = `extract(year from added) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
    var where = ` WHERE ${yearCondition}`;
    if (whereConditions.length > 0) {
        where += ` AND (${whereConditions.join(' OR ')})`;
    }
    return where;
}

export function getRequestSql(filters, yearRange, columns = requestColumnsMap) {
    return `SELECT ${columns.join(',')} FROM ${config.tables.request} ${where(filters, yearRange)}`;
}

// TODO no filters, return nothing?
export function getRequests(filters, yearRange, callback, columns) {
    cartodbSql.execute(getRequestSql(filters, yearRange, columns))
        .done(function (data) {
            callback(data.rows);
        });
}
