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

const data_in_boundary = (i, size, interval) => {
    const x = data_to_canvas(i, size.w);

    const is = {
        w: Math.abs(interval.w.start) + Math.abs(interval.h.end),
        h: Math.abs(interval.w.start) + Math.abs(interval.h.end)
    };

    const ratio = {
        w: is.w / size.w,
        h: is.h / size.h
    }

    return {
        a:  (x.w - size.w / 2.0) * ratio.w,
        b: -(x.h - size.h / 2.0) * ratio.h
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

async function renderBrot () {
    let MAX_ITERATION = 10;

    const canvas= document.getElementById('mandel');
    const context = canvas.getContext("2d");

    const size = {
        w: canvas.width,
        h: canvas.height
    };

    const nextImage = context.createImageData(size.w, size.h);

    console.debug(size, nextImage.data.length);

    let zoom = {
        w: {start: -8, end: 1},
        h: {start: -1, end: 1}
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

    renderNew().then((results) => {
        for ( let i = 0; i < results.length; i++) {
            const n = results[i];

            let ci = 0;
            if(n < MAX_ITERATION) {
                ci = mod(n,colors.length - 1) + 1;
            }

            nextImage.data[i * 4]     = colors[ci][0];
            nextImage.data[i * 4 + 1] = colors[ci][1];
            nextImage.data[i * 4 + 2] = colors[ci][2];
            nextImage.data[i * 4 + 3] = !ci ? 0 : 255;
        }
    });

    context.putImageData(nextImage, 0, 0);

    context.fillStyle = "#fff";
    context.fillRect(div(size.w,2), 0, 1, size.h);
    context.fillRect(0, div(size.h,2), size.w, 1);

    console.log("done");
}

ready.then(async () => {
    ///await renderBrot();
});
