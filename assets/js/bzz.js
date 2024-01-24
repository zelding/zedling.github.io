const z = (e) => { e.classList.add('z'); };
const b = (e) => { e.classList.remove('z'); };

const bzz = (p, cb, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        b(p[i]);
    }

    const d = Math.floor(Math.random() * bd) * dd;

    setTimeout(cb, d, p, cb, bd, dd);
};
const zzz = (p, cb, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        z(p[i]);
    }

    const d = Math.floor(Math.random() * bd + dd);

    setTimeout(bzz, d, p, bd, dd);
};

const hhh = (p, cb, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        z(p[i]);
    }

    console.debug('ja');

    const d = Math.floor(Math.random() + bd + dd);

    setTimeout(bzz, d, p, bd, dd);
};

let e = document.getElementsByClassName('bzz');
let f = document.getElementsByClassName('rich');
let g = document.getElementsByClassName('mni');

bzz(e, zzz, 256,32);
bzz(f, zzz, 128, 128);
bzz(g, hhh, 64, 64);
