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

const data_to_canvas = (i, w) => {
    return {
        w: mod(i, w),
        h: div(i, w)
    };
};

const canvas_to_graph = (x, w, h) => {
    return {
        w: x.w,
        h: -1 * x.h
    };
};

const data_in_boundary = (i, size, interval) => {
    const x = data_to_canvas(i, size.w);
    const y = canvas_to_graph(x, size.w, size.h);

    //return {a: y.w, b: y.h};

    const is = Math.abs(interval.start) + Math.abs(interval.end);
    const ratio = {
        w: is / size.w,
        h: is / size.h
    }

    return {
        a: Math.fround(x.w * ratio.w) ,
        b: Math.fround(x.h * ratio.h)
    };
};

const mandel_iterate = (z, c) => {
    return {
        a: Math.pow(z.a, 2) - Math.pow(z.b, 2) + c.a,
        b: 2.0 * z.a * z.b + c.b
    };
};

const vlen = (z) => {
    return Math.sqrt(Math.pow(z.a, 2) + Math.pow(z.b, 2))
};

ready.then(async () => {
    let MAX_ITERATION = 100;

    const canvas= document.getElementById('mandel');
    const context = canvas.getContext("2d");

    const size = {
        w: canvas.width,
        h: canvas.height
    };

    const nextImage = context.createImageData(size.w, size.h);

    console.debug(size, nextImage.data.length);

    let zoom = {start: -2, end: 1};

    const renderNew = async () => {
        let pixels = [];
        // data is apparently [r,g,b,a, r,g,b,a, r,g,b,a ...]
        for ( let i = 0; i < nextImage.data.length; i += 4) {
            const pixelNo = div(i,4);
            let d = data_in_boundary(pixelNo, size, zoom);

            if (d.a > zoom.end || d.a < zoom.start) {
               //console.log(pixelNo, d);
            }

            pixels.push(checkPixel(d));
        }

        return Promise.all(pixels);
    };

    const checkPixel = async (c) => {
        let n = 0;
        let d = 0;
        let z = {a: 0, b: 0}

        do {
            // z^2 + c
            z = mandel_iterate(z, c);

            d = vlen(z);

            if (d === 0) {
                return MAX_ITERATION;
            }

            n++;
        }
        while(n <= MAX_ITERATION && d < 2.0);

        //console.debug(c);

        return n;
    };

    await renderNew().then((results) => {
        for ( let i = 0; i < results.length; i++) {
            const n = results[i];

            let ci = 0;
            if(n < MAX_ITERATION) {
                ci = mod(n,colors.length - 1) + 1;
            }

            nextImage.data[i * 4]     = colors[ci][0];
            nextImage.data[i * 4 + 1] = colors[ci][1];
            nextImage.data[i * 4 + 2] = colors[ci][2];
            nextImage.data[i * 4 + 3] = 255;
        }
    });

    context.putImageData(nextImage, 0, 0);

    console.log("done");
});
