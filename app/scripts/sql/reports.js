import config from '../config/config';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var reportColumnsData = [
    "'report' AS type",
    'complaint_type',
    'cartodb_id',
    'created_date AS date'
];

export var reportColumnsMap = [
    '*',
    `(created_date AT TIME ZONE '${config.timezone}')::text AS date`
];

function where(filters, yearRange) {
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            if (key === 'sanitation_conditions' && value) {
                return "descriptor IN ('15 Street Cond/Dump-Out/Drop-Off')";
            }
            if (key === 'overflowing_litter_basket' && value) {
                return "descriptor IN ('6 Overflowing Litter Baskets')";
            }
            if (key === 'dirty_conditions' && value) {
                return "descriptor IN ('E1 Improper Disposal', 'E2 Receptacle Violation', 'E3 Dirty Sidewalk', 'E3A Dirty Area/Alleyway', 'E5 Loose Rubbish', 'E11 Litter Surveillance', 'E12 Illegal Dumping Surveillance')";
            }
            return null;
        })
        .filter(function (value) { return value !== null; })
        .value();
    var yearCondition = `extract(year from created_date) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
    var where = ` WHERE  ${yearCondition}`;
    if (whereConditions.length > 0) {
        where += ` AND (${whereConditions.join(' OR ')})`;
    }
    return where;
}

export function getReportSql(filter, yearRange, columns = reportColumnsMap) {
    return `SELECT ${columns} FROM ${config.tables.report} ${where(filter, yearRange)}`;
}

// TODO no filters, return nothing?
export function getReports(filters, yearRange, callback, columns) {
    cartodbSql.execute(getReportSql(filters, yearRange, columns))
        .done(function (data) {
            callback(data.rows);
        });
}
