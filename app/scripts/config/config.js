import moment from 'moment';
import 'moment-timezone';

import dev from './development';
import prod from './production';

var config;

if (process.env.NODE_ENV === 'development') {
    config = dev;
}
else if (process.env.NODE_ENV === 'production') {
    config = prod;
}

// Globals
config.cartodbIntersectionRadius = 25;
config.cartodbUser = 'curbyourlitter';
config.cartodbVisJson = 'https://curbyourlitter.cartodb.com/api/v2/viz/57409c30-4add-11e5-8566-0e853d047bba/viz.json';
config.tables = {
    'intersections': 'intersections',
    'ratings': 'street_ratings',
    'report': 'threeoneone',
    'request': 'canrequests',
    'streets': 'streets'
};
config.minYear = 2010;
config.maxYear = Math.min(moment().tz('America/New_York').year(), 2017);
config.timezone = 'America/New_York';

export default config;
