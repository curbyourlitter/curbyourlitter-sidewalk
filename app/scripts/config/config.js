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

config.bintypes = {
    litter: {
        display: "litter bin",
        subtypes: [
            {
                description: "A nice description of a standard litter bin",
                display: "Standard",
                label: "standard",
                image: "/images/bintypes/litter_standard.jpg"
            },
            {
                description: "A nice description of a BigBelly litter bin",
                display: "BigBelly",
                label: "bigbelly",
                "image": "/images/bintypes/litter_bigbelly.jpg"
            }
        ]
    },
    recycling: {
        display: "recycling bin",
        subtypes: [
            {
                description: "A nice description of a standard bottle and can recycling bin",
                display: "Standard Bottle & Can",
                label: "standard_bottle_can",
                image: "/images/bintypes/recycling_standard_bottle_can.jpg"
            },
            {
                description: "A nice description of a standard paper recycling bin",
                display: "Standard Paper",
                label: "standard_paper",
                image: "/images/bintypes/recycling_standard_paper.jpg"
            },
            {
                description: "A nice description of a BigBelly bottle and can recycling bin",
                display: "BigBelly Bottle & Can",
                label: "bigbelly_bottle_can",
                image: "/images/bintypes/recycling_bigbelly_bottle_can.jpg"
            },
            {
                description: "A nice description of a BigBelly paper recycling bin",
                display: "BigBelly Paper",
                label: "bigbelly_paper",
                image: "/images/bintypes/recycling_bigbelly_paper.jpg"
            }
        ]
    }
};

export default config;
