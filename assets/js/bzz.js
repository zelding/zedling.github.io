const ready = new Promise((fn) => {
    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

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

    if (cb) {
        setTimeout(bzz, d, p, bd, dd);
    }
};

const hhh = (p, cb, bd, dd) => {
    for (let i = 0; i < p.length; i++) {
        z(p[i]);
    }

    const d = Math.floor(Math.random() + bd + dd);

    setTimeout(bzz, d, p, bd, dd);
};

const cl = ['bzz', 'kthx'];
const ab = () => {
    console.log("asd");
    for(let i = 0; i<cl.length;i++) {
        let p = document.getElementsByClassName(cl[i]);

        for (let j = 0; j < p?.length; j++) {
            z(p[j]);
        }
    }
};
const az = () => {
    for(let i = 0; i<cl.length;i++) {
        let p = document.getElementsByClassName(cl[i]);

        for (let j = 0; j < p?.length; j++) {
            b(p[j]);
        }
    }
}

ready.then(async () => {
    let e   = document.getElementsByClassName('bzz');
    let f   = document.getElementsByClassName('rich');
    let g   = document.getElementsByClassName('mni');
    let bts = document.getElementsByClassName('almost_button');

    bzz(e, zzz, 256,32);
    bzz(f, zzz, 128, 128);
    bzz(g, hhh, 64, 64);

    for (let x=0;x<bts.length;x++) {
        bts[x].addEventListener('mouseup', ab);
        bts[x].addEventListener('mousedown ', az);
        bts[x].addEventListener('touchstart', ab);
        bts[x].addEventListener('touchend', az);

        if (bts[x].hasAttribute('secret')) {
            bts[x].addEventListener('pointerenter', ab);
            bts[x].addEventListener('pointerleave', az);
        }
    }
});
