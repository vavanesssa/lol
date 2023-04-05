const isArray = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

export function deepEqual(a, b) {
    // fast-deep-equal index.js 2.0.1
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        const arrA = isArray(a);
        const arrB = isArray(b);
        let i;
        let length;
        let key;

        if (arrA && arrB) {
            length = (a).length;
            if (length !== (b).length) return false;
            for (i = length; i-- !== 0; ) {
                if (!deepEqual((a)[i], (b)[i])) return false;
            }
            return true;
        }

        if (arrA !== arrB) return false;

        const dateA = a instanceof Date;
        const dateB = b instanceof Date;
        if (dateA !== dateB) return false;
        if (dateA && dateB) return (a).getTime() === (b).getTime();

        const regexpA = a instanceof RegExp;
        const regexpB = b instanceof RegExp;
        if (regexpA !== regexpB) return false;
        if (regexpA && regexpB) return a.toString() === b.toString();

        const keys = keyList(a);
        length = keys.length;

        if (length !== keyList(b).length) {
            return false;
        }

        for (i = length; i-- !== 0; ) {
            if (!hasProp.call(b, keys[i])) return false;
        }
        // end fast-deep-equal

        // Custom handling for React
        for (i = length; i-- !== 0; ) {
            key = keys[i];
            if (key === '_owner' && a.$$typeof) {
                // React-specific: avoid traversing React elements' _owner.
                //  _owner contains circular references
                // and is not needed when comparing the actual elements (and not their owners)
                // .$$typeof and ._store on just reasonable markers of a react element
                continue;
            } else {
                // all other properties should be traversed as usual
                if (!deepEqual((a)[key], (b)[key]))
                    return false;
            }
        }

        // fast-deep-equal index.js 2.0.1
        return true;
    }

    // eslint-disable-next-line no-self-compare
    return a !== a && b !== b;
}