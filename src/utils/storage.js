import { KEYS_NOT_TO_DELETE } from "@constants";

export function setKey(key, value) {
    if (window.localStorage) {
        if (value) {
            if (typeof value === 'object') {
                window.localStorage.setItem(key, JSON.stringify(value));
            } else {
                window.localStorage.setItem(key, value);
            }
        }
    }
}

export function getKey(key) {
    if (window.localStorage) {
        return window.localStorage.getItem(key);
    }
    return null;
}

export function checkKey(key) {
    if (window.localStorage) {
        return window.localStorage.getItem(key);
    }
    return null;
}


export async function clearKey() {
    let keysNotDelete = KEYS_NOT_TO_DELETE;
    let keysNotDelete2 = [];

    await keysNotDelete.map(async (val, i) => {
        if (window.localStorage) {
            const value = await getKey(val);
            keysNotDelete2.push({ [keysNotDelete[i]]: typeof value === "object" ? JSON.parse(value) : value })
        }
    })
    if (window.localStorage) {
        window.localStorage.clear();
    }
    keysNotDelete2.map((val, i) => {
        let keysNotDelete3 = Object.keys(keysNotDelete2[i])[0];
        return setKey(keysNotDelete3, val[keysNotDelete3]);
    })
}

export function deleteKey(key) {
    if (window.localStorage) {
        window.localStorage.removeItem(key);
    }
}

