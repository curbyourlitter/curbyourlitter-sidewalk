import {
    LIST_RECORD_HOVERED,
    LIST_RECORD_UNHOVERED,
    MAP_CENTER,
    MAP_IS_READY,
    PIN_DROP_ACTIVE,
    PIN_DROP_MOVED
} from './actions';

export function mapCenter(state = null, action) {
    if (action.type === MAP_CENTER) {
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
