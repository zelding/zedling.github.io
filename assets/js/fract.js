import {C, Point, Size, Interval2D}                  from "./modules/types.js";
import {newColors, data_to_canvas, data_in_boundary} from "./modules/scripts.js";
import {mod, div}                                    from "./modules/math.js";

/** @see https://stackoverflow.com/a/7218469/4308297 */
const debug = true;
let BIG = false;

const ready = new Promise((fn) => {
    if (debug && window.console && window.console.profile) {
        let label = "mandel_bench";
        console.profile(label);
    }

    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

/**
 * @param length :int
 * @param size   :Size
 * @param zoom   :Interval2D
 * @returns {Promise<Awaited<(number|boolean)[]>[]>}
 */
const renderNew = async (length, size, zoom) => {
    let MAX_ITERATION = 60;
    let pixels = [];
    // data is apparently [r,g,b,a, r,g,b,a, r,g,b,a ...]
    for ( let i = 0; i < length; i += 4) {
        const point = data_to_canvas(div(i,4), size.width);
        const d = data_in_boundary(point, size, zoom);

        pixels.push(checkPixel(d, MAX_ITERATION));
    }

    return Promise.all(pixels);
};

/**
 * @param c   :C
 * @param max :int
 * @returns {Promise<(number|boolean)[]>}
 */
const checkPixel = async (c, max= 50) => {
    let n = 0;
    let d = 0.0;
    let z = new C(0, 0, BIG);

    do {
        z = z.iterate(c);
        d = z.length();

        n++;
    }
    while(n < max && d < 2.0);

    return [n, d < 2.0];
};

/**
 * @param context :CanvasRenderingContext2D
 * @param colors  :array<array<int>>
 * @param zoom    :Interval2D
 * @param size    :Size
 * @returns {Promise<ImageData>}
 */
async function renderBrot (context, colors, zoom, size) {
    const nextImage = context.createImageData(size.width, size.height);

    return renderNew(nextImage.data.length, size, zoom).then((results) => {
        for ( let i = 0; i < results.length; i++) {
            if(!results[i][1]) {
                const n   = results[i][0];
                const ci = mod(n,colors.length - 1) + 1;
                nextImage.data[i * 4]     = colors[ci][0];
                nextImage.data[i * 4 + 1] = colors[ci][1];
                nextImage.data[i * 4 + 2] = colors[ci][2];
                nextImage.data[i * 4 + 3] = 255;
            }
        }

        context.putImageData(nextImage, 0, 0);

        context.fillStyle = "#fff";
        context.fillRect(div(size.width,3) * 2, 0, 1, size.height);
        context.fillRect(0, div(size.height,2), size.width, 1);

        return context.getImageData(0, 0, size.width, size.height);
    });
}

ready.then(async () => {
    const canvas      = document.getElementById('mandel');
    const controlForm = document.getElementById('controls');
    /** @var {array<HTMLElement|null>} */
    const controls = {
        'x-start': document.getElementById('x-start'),
        'x-end'  : document.getElementById('x-end'),
        'y-start': document.getElementById('y-start'),
        'y-end'  : document.getElementById('y-end'),
        'reset'  : document.getElementById('res'),
        'big'    : document.getElementById('big')
    };

    const size    = new Size(canvas.width, canvas.height);
    const relSize = new Size(canvas.offsetWidth, canvas.offsetHeight);
    const ctx           = canvas.getContext("2d", {willReadFrequently: true});
    let colors    = await newColors();

    let zoomInterval  = new Interval2D(-2,1, -1, 1, BIG);
    let imageData = renderBrot(ctx, colors, zoomInterval, relSize);

    canvas.addEventListener('mousemove', (e) => {
        //let x = e.offsetX / zoomInterval.x.length(),
        //    y = e.offsetY / zoomInterval.y.length();

        const point = new Point(e.offsetX, e.offsetY);
        const d = data_in_boundary(point, size, zoomInterval);

        const x = div(zoomInterval.x.length(), 4),
              y = div(zoomInterval.y.length(), 4),
              l = Math.sqrt(x*x + y*y);

        controls["x-start"].value = (d.re - l / 2.0).toFixed(3);
        controls["x-end"].value   = (d.re + l / 2.0).toFixed(3);
        controls["y-start"].value = (d.im - l / 2.0).toFixed(3);
        controls["y-end"].value   = (d.im + l / 2.0).toFixed(3);

        //const point_a = new Point(e.offsetX - relSize, e.offsetY);

        window.requestAnimationFrame(async () => {
            const x0 = e.offsetX - div(zoomInterval.x.length(), 8),
                  y0 = e.offsetY - div(zoomInterval.y.length(), 8);

            ctx.putImageData(await imageData, 0, 0);
            ctx.fillStyle   = "#fff";
            ctx.strokeStyle = "#0F0";
            ctx.strokeRect(x0, y0, x, y);

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0+x, y0+y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x0, y0 + y);
            ctx.lineTo(x0+x, y0);
            ctx.stroke();

           // ctx.strokeRect(x0, y0, x0+x, y0);
           // ctx.strokeRect(x0, y0, x, x);
        });
    });

    canvas.addEventListener('click', (e) => {
        console.info(e.offsetX, e.offsetY);

        const point = new Point(e.offsetX, e.offsetY);
        const d = data_in_boundary(point, relSize, zoomInterval);
        console.info(d);

        console.info(zoomInterval);
        zoomInterval = new Interval2D(
            (zoomInterval.x.length() - d.re) / 4.0,
            (zoomInterval.x.length() + d.re) / 4.0,
            (zoomInterval.y.length() - d.im) / 4.0,
            (zoomInterval.y.length() + d.im) / 4.0
        );
        console.info(zoomInterval);

        window.requestAnimationFrame(() => {
            imageData = renderBrot(ctx, colors, zoomInterval, relSize);
        });
    });

    controls.reset.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        controls["x-start"].value = "-2.000";
        controls["x-end"].value   =  "1.000";
        controls["y-start"].value = "-1.000";
        controls["y-end"].value   =  "1.000";
    });

    controlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        BIG = document.getElementById('big').checked ?? false;

        zoomInterval = new Interval2D(
            Math.fround(controls["x-start"].value).toFixed(3) ?? -2.0,
            Math.fround(controls["x-end"].value).toFixed(3)   ??  1.0,
            Math.fround(controls["y-start"].value).toFixed(3) ?? -1.0,
            Math.fround(controls["y-end"].value).toFixed(3)   ??  1.0,
            BIG
        );

        window.requestAnimationFrame(() => {
            imageData = renderBrot(ctx, colors, zoomInterval, relSize);
        });
    });

    if (debug && window.console && window.console.profile) {
        console.profileEnd();
    }

    return imageData;
});
