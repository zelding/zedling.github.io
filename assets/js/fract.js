/** @see https://stackoverflow.com/a/7218469/4308297 */
const debug = false;

const ready = new Promise((fn) => {
    if (debug && window.console && window.console.profile) {
        let label = "mandel_bench";
        console.profile(label);
    }

    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

const newColors = async () => {
    return new Array(16)
        .fill(0)
        .map((_, i) => i === 0
            // black first
                       ? [0, 0, 0]
                       : [((1 << 8) * Math.random() | 0), ((1 << 8) * Math.random() | 0), ((1 << 8) * Math.random() | 0)]
        );
};

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
    re = 0.0;
    im = 0.0;

    constructor(re, im) {
        this.re = re;
        this.im = im;
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
            return new C(this.re,this.im);
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
            this.re + c.re,
            this.im + c.im
        );
    }

    iterate(c) {
        return this.pow(2).add(c);
    }

    length() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}

class Point {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = Math.max(0, x);
        this.y = Math.max(0, y);
    }
}

class Size {
    width = 0;
    height= 0;

    constructor(w, h) {
        this.width  = Math.max(0, w);
        this.height = Math.max(0, h);
    }
}

class Interval {
    start = 0.0;
    end   = 0.0;

    constructor(s, e) {
        this.start = s;
        this.end   = e;
    }
}

class Interval2D {
    x = new Interval(0, 0);
    y = new Interval(0, 0);

    constructor(x1, x2, y1, y2) {
        this.x = new Interval(x1, x2);
        this.y = new Interval(y1, y2);
    }
}

const data_to_canvas = (i, w) => {
    return new Point(
        mod(i, w),
        div(i, w)
    );
};

// @link https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
//                        |, [s.w, s.h] [i.w.s, i.w.e]
/**
 *
 * @param point :Point
 * @param size :Size
 * @param interval : Interval2D
 * @returns {C}
 */
const data_in_boundary = (point, size, interval) => {
    const re = interval.x.start + ( (interval.x.end - interval.x.start) / size.width )  * (point.x)
    const im = interval.y.start + ( (interval.y.end - interval.y.start) / size.height ) * (point.y)

    return new C(re, -im);
};

/**
 *
 * @param context {CanvasRenderingContext2D}
 * @param colors {array<array<int>>}
 * @param zoom {Interval2D}
 * @param size {Size}
 * @returns {Promise<void>}
 */
async function renderBrot (context, colors, zoom, size) {
    let MAX_ITERATION = 100;

    const nextImage = context.createImageData(size.width, size.height);

    const renderNew = () => {
        let pixels = [];
        // data is apparently [r,g,b,a, r,g,b,a, r,g,b,a ...]
        for ( let i = 0; i < nextImage.data.length; i += 4) {
            const point = data_to_canvas(div(i,4), size.width);
            const d = data_in_boundary(point, size, zoom);

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

    return renderNew().then((results) => {
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
        context.fillRect(div(size.width,2), 0, 1, size.height);
        context.fillRect(0, div(size.height,2), size.width, 1);
    });
}

ready.then(async () => {
    const canvas      = document.getElementById('mandel');
    const controlForm = document.getElementById('controls');
    const controls = {
        'x-start': document.getElementById('x-start'),
        'x-end'  : document.getElementById('x-end'),
        'y-start': document.getElementById('y-start'),
        'y-end'  : document.getElementById('y-end'),
    };
    const size    = new Size(canvas.width, canvas.height);
    const relSize = new Size(canvas.offsetWidth, canvas.offsetHeight);
    const ctx           = canvas.getContext("2d");

    let colors    = await newColors();
    let zoom = new Interval2D(-2.0,1, -1, 1);

    let asd = 0;
    /*canvas.addEventListener('mousemove', (e) => {
        const point = new Point(e.offsetX, e.offsetY);

        const d = data_in_boundary(point, relSize, zoom);

        console.log(size, point, d);

        zoom = new Interval2D(
            Math.fround(controls["x-start"].value) * 0.8,
            Math.fround(controls["x-end"].value)   * 0.8,
            Math.fround(controls["y-start"].value) * 0.8,
            Math.fround(controls["y-end"].value)   * 0.8
        );

        renderBrot(ctx, colors, zoom, size);
    });*/

    canvas.addEventListener('click', (e) => {
        const point = new Point(e.offsetX, e.offsetY);
        const d = data_in_boundary(point, relSize, zoom);

        zoom = new Interval2D(
            d.re * 0.85,
            d.re * 1.15,
            d.im * 0.85,
            d.im * 1.15
        );

        renderBrot(ctx, colors, zoom, size);
    });

    controlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        //colors = await newColors();

        zoom = new Interval2D(
            Math.fround(controls["x-start"].value) ?? -2.0,
            Math.fround(controls["x-end"].value)   ??  1,
            Math.fround(controls["y-start"].value) ?? -1,
            Math.fround(controls["y-end"].value)   ??  1
        );

        await renderBrot(ctx, colors, zoom, size);

        return false;
    });

    let a = await renderBrot(ctx, colors, zoom, size);

    if (debug && window.console && window.console.profile) {
        console.profileEnd();
    }

    return a;
});
