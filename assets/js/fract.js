const ready = new Promise((fn) => {
    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

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


const canvas_to_graph = (x, w, h) => {
    return {
        w: x.w - div(w, 2),
        h: x.h - div(h, 2)
    };
};

const data_to_canvas = (i, w, h) => {
    return {
        w: div(i, w),
        h: mod(i, h)
    };
};

const mandel_iterate = (z, c) => {
    return {
        a: Math.pow(z.a, 2) - Math.pow(z.b, 2) + c.a,
        b: 2.0 * z.a * z.b + c.b
    };
};

ready.then(async () => {
    let MAX_ITERATION = 10;

    const canvas      = document.getElementById('mandel');
    const size = {
        w: canvas.getAttribute('width')  | 320,
        h: canvas.getAttribute('height') | 240
    };

    const context              = canvas.getContext("2d");
    const nextImage = context.createImageData(size.w, size.h);

    const renderNew = async () => {
        let pixels = [];
        // data is apparently [r,g,b, r,g,b, r,g,b ...]
        for ( let i = 0; i < nextImage.data.length; i += 4) {
             pixels.push(checkPixel(i));
        }

        Promise.all(pixels).then((results) => {
            for ( let i = 0; i < results.length; i++) {
                if(results[i] >= MAX_ITERATION) {
                    console.debug("hit", canvas_to_graph(data_to_canvas(i, size.w, size.h), size.w, size.h));

                    nextImage.data[i]     = 255;
                    nextImage.data[i + 1] = 255;
                    nextImage.data[i + 2] = 255;
                }
            }
        });
    };

    const checkPixel = async (i) => {
        const ci = div(i, 4);

        const canvasCoord = canvas_to_graph(data_to_canvas(ci, size.w, size.h), size.w, size.h);
        const c = {a: canvasCoord.w, b: canvasCoord.h};

        let n = 0;
        let d = 0;
        let z = {a: 0, b: 0}

        do {
            // z^2 + c
            z = mandel_iterate(z, c);

            d = Math.sqrt(Math.pow(z.a, 2) + Math.pow(z.b, 2));

            if (d === 0) {
                return MAX_ITERATION;
            }

            n++;
        }
        while(n <= MAX_ITERATION && d <= 2.0);

        return n;
    };

    await renderNew();

    context.putImageData(nextImage, 0, 0);
    context.drawImage(canvas, 0, 0);

    console.log("done");
});
