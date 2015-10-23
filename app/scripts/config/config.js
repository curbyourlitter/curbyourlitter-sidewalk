import moment from 'moment';

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
    'can': 'cans',
    'intersections': 'intersections',
    'ratings': 'street_ratings',
    'report': 'threeoneone',
    'reportCodes': 'threeoneone_codes',
    'request': 'canrequests',
    'streets': 'streets'
};
config.minYear = 2010;
config.maxYear = Math.min(moment().year(), 2017);
config.timezone = 'America/New_York';

config.bintypes = {
    litter: {
        display: "litter bin",
        subtypes: [
            {
                description: "A covered litter bin accepts all types of pedestrian trash. Everything thrown away here goes to a landfill.",
                display: "Standard",
                label: "standard",
                image: "/images/bintypes/litter_standard.jpg"
            },
            {
                description: "A BigBelly litter bin uses solar panels to compact trash that is sent to a landfill.",
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
                description: "Bottle & Can recycling bins take only metal cans and plastic bottles to be recycled.",
                display: "Standard Bottle & Bin",
                label: "standard_bottle_can",
                image: "/images/bintypes/recycling_standard_bottle_can.jpg"
            },
            {
                description: "Paper recycling bins take only clean paper to be recycled.",
                display: "Standard Paper",
                label: "standard_paper",
                image: "/images/bintypes/recycling_standard_paper.jpg"
            },
            {
                description: "This type of bin uses solar panels to compact metal cans and plastic bottles to be recycled.",
                display: "BigBelly Bottle & Bin",
                label: "bigbelly_bottle_can",
                image: "/images/bintypes/recycling_bigbelly_bottle_can.jpg"
            },
            {
                description: "This type of bin uses solar panels to compact clean paper to be recycled.",
                display: "BigBelly Paper",
                label: "bigbelly_paper",
                image: "/images/bintypes/recycling_bigbelly_paper.jpg"
            }
        ]
    }
};

export default config;
