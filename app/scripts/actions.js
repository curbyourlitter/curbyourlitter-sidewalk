export const ADD_END = 'ADD_END';
export const ADD_START = 'ADD_START';
export const FILTERS_CLEAR = 'FILTERS_CLEAR';
export const FILTERS_SHOWN = 'FILTERS_SHOWN';
export const FILTERS_TOGGLE = 'FILTERS_TOGGLE';
export const FILTERS_UPDATE = 'FILTERS_UPDATE';
export const MAP_CENTER = 'MAP_CENTER';
export const MAP_MOVED = 'MAP_MOVED';
export const MAP_IS_READY = 'MAP_IS_READY';
export const MAP_RECORD_HOVERED = 'MAP_RECORD_HOVERED';
export const MAP_RECORD_UNHOVERED = 'MAP_RECORD_UNHOVERED';
export const PANEL_SHOWN = 'PANEL_SHOWN';
export const PANEL_TOGGLE = 'PANEL_TOGGLE';
export const PIN_DROP_ACTIVE = 'PIN_DROP_ACTIVE';
export const PIN_DROP_DRAG_ACTIVE = 'PIN_DROP_DRAG_ACTIVE';
export const PIN_DROP_MOVED = 'PIN_DROP_MOVED';
export const LIST_RECORD_HOVERED = 'LIST_RECORD_HOVERED';
export const LIST_RECORD_UNHOVERED = 'LIST_RECORD_UNHOVERED';
export const RECORD_SELECTED = 'RECORD_SELECTED';
export const RECORD_UNSELECTED = 'RECORD_UNSELECTED';
export const REQUESTS_REQUIRE_RELOAD = 'REQUESTS_REQUIRE_RELOAD';

export function startAddRequest() {
    return { type: ADD_START };
}

export function endAddRequest() {
    return { type: ADD_END };
}

export function filtersClear() {
    return { type: FILTERS_CLEAR };
}

export function filtersHide() {
    return {
        type: FILTERS_TOGGLE,
        visible: false
    };
}

export function filtersShow() {
    return {
        type: FILTERS_TOGGLE,
        visible: true
    };
}

export function filtersShown(width) {
    return {
        type: FILTERS_SHOWN,
        width: width
    };
}

export function filtersUpdate(layer, filter, value) {
    return {
        filter: filter,
        layer: layer,
        type: FILTERS_UPDATE,
        value: value
    };
}

export function panelShown(width) {
    return {
        type: PANEL_SHOWN,
        width: width
    };
}

export function panelToggle(visible) {
    return {
        visible: visible,
        type: PANEL_TOGGLE
    };
}

export function mapCenter(latlng) {
    return {
        latlng: latlng,
        type: MAP_CENTER
    };
}

export function mapMoved(bbox, latlng) {
    return {
        bbox: bbox,
        latlng: latlng,
        type: MAP_MOVED
    };
}

export function mapIsReady() {
    return { type: MAP_IS_READY };
}

export function pinDropActive(active) {
    return {
        active: active,
        type: PIN_DROP_ACTIVE 
    };
}

export function pinDropDragActive(active) {
    return {
        active: active,
        type: PIN_DROP_DRAG_ACTIVE 
    };
}

export function pinDropMoved(latlng, valid) {
    return {
        latlng: latlng,
        type: PIN_DROP_MOVED,
        valid: valid
    };
}

export function listRecordHovered(id, recordType) {
    return {
        id: id,
        recordType: recordType,
        type: LIST_RECORD_HOVERED
    };
}

export function listRecordUnhovered() {
    return {
        type: LIST_RECORD_UNHOVERED
    };
}

export function mapRecordHovered(id, recordType) {
    return {
        id: id,
        recordType: recordType,
        type: MAP_RECORD_HOVERED
    };
}

export function mapRecordUnhovered() {
    return {
        type: MAP_RECORD_UNHOVERED
    };
}

export function recordSelected(id, recordType) {
    return {
        id: id,
        recordType: recordType,
        type: RECORD_SELECTED
    };
}

export function recordUnselected() {
    return {
        type: RECORD_UNSELECTED
    };
}

export function requestsRequireReload(requireReload) {
    return {
        requireReload: requireReload,
        type: REQUESTS_REQUIRE_RELOAD
    };
}
