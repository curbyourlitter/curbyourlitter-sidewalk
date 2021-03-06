import config from './config/config';

import {
    ADD_END,
    ADD_START,
    FILTERS_CLEAR,
    FILTERS_SHOWN,
    FILTERS_TOGGLE,
    FILTERS_UPDATE,
    LIST_RECORD_HOVERED,
    LIST_RECORD_UNHOVERED,
    MAP_CENTER,
    MAP_MOVED,
    MAP_IS_READY,
    MAP_RECORD_HOVERED,
    MAP_RECORD_UNHOVERED,
    PANEL_SHOWN,
    PANEL_TOGGLE,
    PIN_DROP_ACTIVE,
    PIN_DROP_DRAG_ACTIVE,
    PIN_DROP_MOVED,
    RECORD_SELECTED,
    RECORD_UNSELECTED,
    REQUESTS_REQUIRE_RELOAD
} from './actions';

var DEFAULT_BIN_FILTERS = {
    existing: true,
    new: true
};

var DEFAULT_RATING_FILTERS = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true
};

var DEFAULT_REPORT_FILTERS = {
    dirty_conditions: true,
    overflowing_litter_basket: true,
    sanitation_conditions: true
};

var DEFAULT_REQUEST_FILTERS = {
    litter: false,
    bigbelly: false,
    recycling: false,
    sightings: true
};

var DEFAULT_YEAR_FILTERS = {
    start: config.maxYear - 1,
    end: config.maxYear
};

export function addingRequest(state = false, action) {
    if (action.type === ADD_START) {
        return true;
    }
    if (action.type === ADD_END) {
        return false;
    }
    return state;
}

export function filtersWidth(state = 0, action) {
    if (action.type === FILTERS_SHOWN) {
        return action.width;
    }
    if (action.type === FILTERS_TOGGLE && !action.visible) {
        return 0;
    }
    return state;
}

export function filtersVisible(state = true, action) {
    if (action.type === FILTERS_TOGGLE) {
        return action.visible;
    }
    return state;
}

export function binFilters(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_BIN_FILTERS);
    }
    if (action.type === FILTERS_UPDATE && action.layer === 'bin') {
        state[action.filter] = action.value;
    }
    if (action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_BIN_FILTERS);
    }
    return state;
}

export function ratingFilters(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_RATING_FILTERS);
    }
    if (action.type === FILTERS_UPDATE && action.layer === 'rating') {
        state[action.filter] = action.value;
    }
    if (action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_RATING_FILTERS);
    }
    return state;
}

export function reportFilters(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_REPORT_FILTERS);
    }
    if (action.type === FILTERS_UPDATE && action.layer === 'report') {
        state[action.filter] = action.value;
    }
    if (action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_REPORT_FILTERS);
    }
    return state;
}

export function requestFilters(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_REQUEST_FILTERS);
    }
    if (action.type === FILTERS_UPDATE && action.layer === 'request') {
        state[action.filter] = action.value;
    }
    if (action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_REQUEST_FILTERS);
    }
    return state;
}

export function yearFilters(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_YEAR_FILTERS);
    }
    if (action.type === FILTERS_UPDATE && action.layer === 'year') {
        state[action.filter] = action.value;
    }
    if (action.type === FILTERS_CLEAR) {
        state = _.extend({}, DEFAULT_YEAR_FILTERS);
    }
    return state;
}

export function mapBoundingBox(state = null, action) {
    if (action.type === MAP_MOVED) {
        return action.bbox;
    }
    return state;
}

export function mapCenter(state = null, action) {
    if (action.type === MAP_CENTER || action.type === MAP_MOVED) {
        return action.latlng;
    }
    return state;
}

export function mapReady(state = false, action) {
    if (action.type === MAP_IS_READY) {
        return true;
    }
    return state;
}

export function pinDropActive(state = false, action) {
    if (action.type === PIN_DROP_ACTIVE) {
        return action.active;
    }
    return state;
}

export function pinDropDragActive(state = false, action) {
    if (action.type === PIN_DROP_DRAG_ACTIVE) {
        return action.active;
    }
    return state;
}

export function pinDropValid(state = false, action) {
    if (action.type === PIN_DROP_MOVED) {
        return action.valid;
    }
    return state;
}

export function pinDropLatlng(state = null, action) {
    if (action.type === PIN_DROP_MOVED) {
        return action.latlng;
    }
    return state;
}

export function panelVisible(state = false, action) {
    if (action.type === PANEL_SHOWN) {
        return true;
    }
    if (action.type === PANEL_TOGGLE) {
        return action.visible;
    }
    return state;
}

export function panelWidth(state = 0, action) {
    if (action.type === PANEL_SHOWN) {
        return action.width;
    }
    if (action.type === PANEL_TOGGLE && !action.visible) {
        return 0;
    }
    return state;
}

export function listRecordHovered(state = null, action) {
    if (action.type === LIST_RECORD_HOVERED) {
        return {
            id: action.id,
            recordType: action.recordType
        };
    }
    if (action.type === LIST_RECORD_UNHOVERED) {
        return null;
    }
    return state;
}

export function mapRecordHovered(state = null, action) {
    if (action.type === MAP_RECORD_HOVERED) {
        return {
            id: action.id,
            recordType: action.recordType
        };
    }
    if (action.type === MAP_RECORD_UNHOVERED) {
        return null;
    }
    return state;
}

export function recordSelected(state = null, action) {
    if (action.type === RECORD_SELECTED) {
        return {
            id: action.id,
            recordType: action.recordType
        };
    }
    if (action.type === RECORD_UNSELECTED) {
        return null;
    }
    return state;
}

export function requestsRequireReload(state = false, action) {
    if (action.type === REQUESTS_REQUIRE_RELOAD) {
        return action.requireReload;
    }
    return state;
}
