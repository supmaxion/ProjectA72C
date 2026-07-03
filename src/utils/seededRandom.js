

// String seedből 32-bites egész hash (xmur3)
function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

// Determinisztikus PRNG (mulberry32), 0..1 közötti értékeket ad
function mulberry32(seedInt) {
    let a = seedInt;
    return () => {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Determinisztikus RNG-t ad vissza egy string seedből.
 * Ugyanaz a seed mindig ugyanazt a szám-sorozatot adja.
 */
export function createRng(seed) {
    const seedFn = xmur3(String(seed));
    return mulberry32(seedFn());
}
