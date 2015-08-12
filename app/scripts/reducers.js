import { MAP_IS_READY, PIN_DROP_ACTIVE, PIN_DROP_MOVED } from './actions';

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

export function pinDropLatlng(state = null, action) {
    if (action.type === PIN_DROP_MOVED) {
        return action.latlng;
    }
    return state;
}
