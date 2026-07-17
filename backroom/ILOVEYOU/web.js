class WebSegment {
    constructor(x1, y1, x2, y2, webLength, res=40) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.webLength = webLength;
        this.res = res;
        this.points = this.solvePoints();
    }

    // Fuck it I barely understand the math here, thank god for tutorials and stackoverflow
    solvePoints() {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;

        const straightDistance = Math.sqrt(dx * dx + dy * dy);

        // Rope cannot be shorter than straight-line distance
        if (this.webLength < straightDistance) {
            this.webLength = straightDistance;
        }

        // Nearly straight
        if (this.webLength <= straightDistance * 1.000001) {
            const points = [];
            for (let i = 0; i <= this.res; i++) {
                const t = i / this.res;
                points.push({
                    x: this.x1 + dx * t,
                    y: this.y1 + dy * t
                });
            }
            return points;
        }


        // Vertical case
        if (Math.abs(dx) < 0.0001) {
            const points = [];
            for (let i = 0; i <= this.res; i++) {
                const t = i / this.res;
                points.push({
                    x: this.x1,
                    y: this.y1 + dy * t
                });
            }
            return points;
        }
        
        // To deal with scope shit 
        let x1 = this.x1;
        let y1 = this.y1;
        let x2 = this.x2;
        let y2 = this.y2;

        // Make order easier to work with
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        const D = x2 - x1;
        const H = y2 - y1;

        const midpoint = (x1 + x2) / 2;
        const halfWidth = D / 2;

        // Finds parameters given an a
        function getParameters(a) {

            const sinhTerm = Math.sinh(halfWidth / a);
            const s = Math.asinh(-H / (2 * a * sinhTerm));

            const x0 = midpoint - a * s;
            const length = 2 * a * sinhTerm * Math.cosh(s);

            return { x0: x0, length: length};
        }


        // Bin search for the correct val for a
        let low = 0.0001;
        let high = Math.max(D, Math.abs(H));
        while (getParameters(high).length > this.webLength) {
            high *= 2;
        }
        for (let iteration = 0; iteration < 100; iteration++) {
            const a = (low + high) / 2;
            const currentLength = getParameters(a).length;
            if (currentLength > this.webLength) {
                low = a;
            } else {
                high = a;
            }
        }

        const a = (low + high) / 2;
        const parameters = getParameters(a);
        const x0 = parameters.x0;
        const c = y1 + a * Math.cosh((x1 - x0) / a);
        
        // Generate the points man fuck idc
        const points = [];
        for (let i = 0; i <= this.res; i++) {
            const t = i / this.res;
            const x = x1 + (x2 - x1) * t;
            const y = -a * Math.cosh((x - x0) / a) + c;
            points.push({
                x: x,
                y: y
            });
        }

        // We swapped endpoint order maybe, swap back if you did
        if (this.x1 > this.x2) {
            points.reverse();
        }

        return points;
    }

    // So we can move it
    updateParams(params = {}) {
        if (params.x1 !== undefined) { this.x1 = params.x1; }
        if (params.y1 !== undefined) { this.y1 = params.y1; }
        if (params.x2 !== undefined) { this.x2 = params.x2; }
        if (params.y2 !== undefined) { this.y2 = params.y2; }
        if (params.webLength !== undefined) { this.webLength = params.webLength; }
        if (params.res !== undefined) { this.res = params.res; }

        this.points = this.solvePoints();
    }

    draw(context, drawWidth=2, webColour="white") {
        context.beginPath();

        context.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y);
        }

        context.strokeStyle = webColour;
        context.lineWidth = drawWidth;

        context.stroke();
    }
}