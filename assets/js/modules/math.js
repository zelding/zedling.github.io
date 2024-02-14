/*
 * @see https://stackoverflow.com/a/77111866/4308297
 */

export const div = (a, b) => {
    return Math.sign(b) * Math.floor(a / Math.abs(b));
}
/**
 *
 * @param a :int
 * @param b :int
 * @returns {int}
 */
export const mod = (a, b) => {
    const z = Math.abs(b);
    return ((a % z) + z) % z;
}
