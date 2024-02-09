const ready = new Promise((fn) => {
    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

const colors = new Array(16)
    .fill(0)
    .map((_, i) => i === 0
        // black first
        ? [0, 0, 0]
        : [((1 << 8) * Math.random() | 0), ((1 << 8) * Math.random() | 0), ((1 << 8) * Math.random() | 0)]
    );

/*
 * @see https://stackoverflow.com/a/77111866/4308297
 */
function div(a, b) {
    return Math.sign(b) * Math.floor(a / Math.abs(b));
}
function mod(a, b) {
    const z = Math.abs(b);
    return ((a % z) + z) % z;
}

class C {
    im = 0.0;
    re = 0.0;

    constructor(im, re) {
        this.im = im;
        this.re = re;
    }

    static cross(a, b) {
        return new C(
            a.re * b.re - a.im * b.im,
            a.im * b.re + a.re * b.im
        );
    }

    // sanic
    // @see https://www.geeksforgeeks.org/program-for-power-of-a-complex-number-in-olog-n/
    pow(x) {
        if (x === 0) {
            return new C(0,0);
        }

        if (x === 1) {
            return new C(this.im,this.re);
        }

        // Recursive call for n/2
        const sq = this.pow(x / 2);

        if (x % 2 === 0) {
            return C.cross(sq, sq);
        }

        return C.cross(z, C.cross(sq, sq));
    }

    add(c) {
        return new C(
            this.im + c.im,
            this.re + c.re
        );
    }

    iterate(c) {
        return this.pow(2).add(c);
    }

    length() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}

const data_to_canvas = (i, w) => {
    return {
        w: mod(i, w),
        h: div(i, w)
    };
};

// @link https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
//                        |, [s.w, s.h] [i.w.s, i.w.e]
const data_in_boundary = (i, size, interval) => {
    const t = data_to_canvas(i, size.w);

    const re = interval.w.start + ( (interval.w.end - interval.w.start) / size.w ) * (t.w)
    const im = interval.h.start + ( (interval.h.end - interval.h.start) / size.h ) * (t.h)

    return new C(re, -im);
};

async function renderBrot () {
    let MAX_ITERATION = 30;

    const canvas= document.getElementById('mandel');
    const context = canvas.getContext("2d");

    const size = {
        w: canvas.width,
        h: canvas.height
    };

    const nextImage = context.createImageData(size.w, size.h);

    let zoom = {
        w: {start: -2.0, end: 1.0},
        h: {start: -1.0, end: 1.0}
    };

    const renderNew = () => {
        let pixels = [];
        // data is apparently [r,g,b,a, r,g,b,a, r,g,b,a ...]
        for ( let i = 0; i < nextImage.data.length; i += 4) {
            const pixelNo = div(i,4);
            const d = data_in_boundary(pixelNo, size, zoom);

            pixels.push(checkPixel(d));
        }

        return Promise.all(pixels);
    };

    const checkPixel = async (c) => {
        let n = 0;
        let d = 0.0;
        let z = new C(0, 0);

        do {
            z = z.iterate(c);
            d = z.length();

            n++;
        }
        while(n < MAX_ITERATION && d < 2.0);

        return [n, d < 2.0];
    };

    renderNew().then((results) => {
        for ( let i = 0; i < results.length; i++) {
            const n = results[i][0];

            let ci = 0;
            if(!results[i][1]) {
                ci = mod(n,colors.length - 1) + 1;
            }

            nextImage.data[i * 4]     = colors[ci][0];
            nextImage.data[i * 4 + 1] = colors[ci][1];
            nextImage.data[i * 4 + 2] = colors[ci][2];
            nextImage.data[i * 4 + 3] = 255;
        }

        context.putImageData(nextImage, 0, 0);

        context.fillStyle = "#fff";
        context.fillRect(div(size.w,2), 0, 1, size.h);
        context.fillRect(0, div(size.h,2), size.w, 1);
    });

    console.log("done");
}

ready.then(async () => {
    await renderBrot();
});
