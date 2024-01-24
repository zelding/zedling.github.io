const z = (e) => { e.classList.add('z'); };
const b = (e) => { e.classList.remove('z'); };

let e = document.getElementsByClassName('bzz');
let f = document.getElementsByClassName('rich');

let bzz = (p, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        b(p[i]);
    }

    const d = Math.floor(Math.random() * bd) * dd;

    setTimeout(zzz, d, p, bd, dd);
};

let zzz = (p, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        z(p[i]);
    }

    const d = Math.floor(Math.random() * bd + dd);

    setTimeout(bzz, d, p, bd, dd);
};

bzz(e, 256,32);
bzz(f, 128, 128);
