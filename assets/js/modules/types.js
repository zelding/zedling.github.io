import {BigNumber} from "./bn.js";

class Biggable {
    _big = false;
    constructor (big = false) {
        this._big = big;
    }
}

export class C extends Biggable{
    re;
    im;

    constructor(re, im, big = false) {
        super(big);

        if (this._big) {
            this.re = new BigNumber(re);
            this.im = new BigNumber(im);
        }
        else {
            this.re = re;
            this.im = im;
        }
    }

    static cross(a, b) {
        if (this._big ) {
            return new C(
                a.re.times(b.re).minus(a.im.times(b.im)),
                a.im.times(b.re).plus(a.re.times(b.im))
            );
        }

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

        return C.cross(this, C.cross(sq, sq));
    }

    /**
     *
     * @param c :C
     * @returns {C}
     */
    add(c) {
        if (this._big) {
            return new C(
                this.re.plus(c.re),
                this.im.plus(c.im)
            );
        }

        return new C(
            this.re + c.re,
            this.im + c.im
        );
    }

    iterate(c) {
        return this.pow(2).add(c);
    }

    length() {
        if (this._big) {
            return this.re.times(this.re).plus(this.im.times(this.im)).sqrt().toNumber();
        }

        return (this.re * this.re + this.im * this.im) ** 1/2;
    }
}

export class Point {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = Math.max(0, x);
        this.y = Math.max(0, y);
    }
}

export class Size {
    width = 0;
    height= 0;

    constructor(w, h) {
        this.width  = Math.max(0, w);
        this.height = Math.max(0, h);
    }
}

class Interval extends Biggable{
    start;
    end;

    constructor(s, e, big= false) {
        super(big);
        if(this._big) {
            this.start = BigNumber.BigNumber(s);
            this.end   = BigNumber.BigNumber(e);
        }
        else {
            this.start = s;
            this.end   = e;
        }
    }
}

export class Interval2D extends Biggable{
    /** @var Interval */
    x;
    /** @var Interval */
    y;

    constructor(x1, x2, y1, y2, big = false) {
        super(big); // I don't need it atm, but might be useful later
        this.x = new Interval(x1, x2, big);
        this.y = new Interval(y1, y2, big);
    }
}
