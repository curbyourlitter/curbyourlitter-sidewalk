export const MAP_CENTER = 'MAP_CENTER';
export const MAP_IS_READY = 'MAP_IS_READY';
export const PIN_DROP_ACTIVE = 'PIN_DROP_ACTIVE';
export const PIN_DROP_MOVED = 'PIN_DROP_MOVED';
export const LIST_RECORD_HOVERED = 'LIST_RECORD_HOVERED';
export const LIST_RECORD_UNHOVERED = 'LIST_RECORD_UNHOVERED';

export function mapCenter(latlng) {
    return {
        latlng: latlng,
        type: MAP_CENTER
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
