/**
 * @license
 *
 * Copyright (c) 2019 Leung Ho Pan Alvin. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Immutable from 'immutable';
import { merge } from '@alvinleung1996/immutable';



export interface ObjectMap<T> {
    readonly [key: string]: T;
}


export const EMPTY: ObjectMap<never> = Object.freeze({});



export const from: {
    <T extends { readonly id: string; }>(array: ReadonlyArray<T>, key?: (val: T) => string): ObjectMap<T>;
    <T>(array: ReadonlyArray<T>, key: (val: T) => string): ObjectMap<T>
} = <T>(array: ReadonlyArray<T>, key?: (val: T) => string) => {
    if (key === undefined) {
        key = (val: any) => {
            if (val.key === undefined) throw new TypeError('Missing key property');
            return val.key;
        };
    }

    return array.reduce<Record<string, T>>((obj, val) => {
        obj[key!(val)] = val;
        return obj;
    }, {});
};



export const remove = <T>(
    val: ObjectMap<T>,
    key: string
): ObjectMap<T> => Immutable.remove(val, key);



export const map = <T>(
    val: ObjectMap<T>,
    mapper: (item: T, key: string) => T
) => {
    return merge(
        val,
        Object.entries(val)
            .reduce<Writable<ObjectMap<T>>>((newVal, [key, val]) => {
                newVal[key] = mapper(val, key);
                return newVal;
            }, EMPTY)
    );
};



const removeExtra = <T>(
    oldVal: ObjectMap<T>,
    newVal: ObjectMap<T>
) => Object.keys(oldVal)
    .filter(key => newVal[key] === undefined)
    .reduce((oldVal, key) => remove(oldVal, key), oldVal);

/**
 * Remove extra keys from `oldVal` and merge `oldVal` with `newVal`
 * @param args
 */
export const migrate = <T>(
    oldVal: ObjectMap<T>,
    newVal: ObjectMap<T>,
    merger?: (oldVal: T, newVal: T) => T
): Readonly<Record<string, T>> => {
    oldVal = removeExtra(oldVal, newVal);
    return merge(oldVal, newVal, merger as any);
};
