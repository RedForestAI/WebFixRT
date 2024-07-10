export class RT_IVT_ALGO {
    constructor() {
        this.prior_x = null;
        this.prior_y = null;
        this.prior_t = null;
        this.isFix = null;
        this.elapsed_times = [];
    }

    rt_ivt2(pt, elapsed_time, threshold, min_dur) {
        if (this.prior_x == null && this.prior_y == null) {
            this.prior_x = parseFloat(pt.x);
            this.prior_y = parseFloat(pt.y);
            this.prior_t = elapsed_time;
            return null;
        }

        let dX = parseFloat(pt.x) - this.prior_x;
        let dY = parseFloat(pt.y) - this.prior_y;

        let v = Math.abs((dX + dY) / 2);
        this.prior_x = parseFloat(pt.x);
        this.prior_y = parseFloat(pt.y);

        if (v < threshold) {
            if (this.isFix == 1) {
                this.elapsed_times.push(elapsed_time);
                return null;
            } else {
                this.isFix = 1;
                this.elapsed_times.push(elapsed_time);
                return null;
            }
        } else {
            if (this.isFix == 1) {
                let x = this.prior_x;
                let y = this.prior_y;
                let dur = elapsed_time - this.elapsed_times[0];
                this.elapsed_times = []; 
                this.isFix = 0;
                if (dur < min_dur) {
                    return null;
                }
                let fixation = { x: x, y: y, duration: dur, end_time: elapsed_time };
                return fixation;
            } else {
                return null;
            }
        }
    }
}