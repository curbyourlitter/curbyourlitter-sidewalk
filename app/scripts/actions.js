export const MAP_IS_READY = 'MAP_IS_READY';
export const PIN_DROP_ACTIVE = 'PIN_DROP_ACTIVE';
export const PIN_DROP_MOVED = 'PIN_DROP_MOVED';

export function mapIsReady() {
    return { type: MAP_IS_READY };
}

export function pinDropActive(active) {
    return {
        active: active,
        type: PIN_DROP_ACTIVE 
    };
}

export function pinDropMoved(latlng) {
    return {
        latlng: latlng,
        type: PIN_DROP_MOVED 
    };
}
