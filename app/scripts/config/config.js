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
    'report': 'threeoneone',
    'request': 'canrequests'
};

export default config;
