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


const graph_to_canvas = (x, y) => {
    return {
        w: x - 50,
        h: y - 50
    };
};

const data_to_canvas = (i, w, h) => {
    return {
        w: div(i, w),
        h: mod(i, h)
    };
};

ready.then(async () => {
    const canvas      = document.getElementById('mandel');
    const size = {
        w: canvas.getAttribute('width')  | 320,
        h: canvas.getAttribute('height') | 240
    };

    const context              = canvas.getContext("2d");
    const nextImage = context.createImageData(size.w, size.h);

    // data is apparently [r,g,b, r,g,b, r,g,b ...]
    for ( let i = 0; i < nextImage.data.length; i += 4) {
        const ci = div(i, 4);

        const canvasCoord = data_to_canvas(ci, size.w, size.h);

        nextImage.data[i]   = 0;
        nextImage.data[i+1] = 0;
        nextImage.data[i+2] = 0;
    }

    context.putImageData(nextImage, 0, 0);
});
