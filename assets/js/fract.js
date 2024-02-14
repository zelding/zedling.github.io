import {C, Point, Size, Interval2D} from './modules/types.js';
import {newColors, data_to_canvas, data_in_boundary} from "./modules/scripts.js";
import {mod, div}                   from "./modules/math.js";

/** @see https://stackoverflow.com/a/7218469/4308297 */
const debug = true;

const ready = new Promise((fn) => {
    if (debug && window.console && window.console.profile) {
        let label = "mandel_bench";
        console.profile(label);
    }

    document.addEventListener('DOMContentLoaded', fn,{ once:true });
});

/** asd
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
        let z = new C(0, 0, true);

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
            d.re.times(0.85),
            d.re.times(1.15),
            d.im.times(0.85),
            d.im.times(1.15)
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
