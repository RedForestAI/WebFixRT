export class RT_IDT_ALGO {
    constructor() {
        this.seq_x = [];
        this.seq_y = [];
        this.prior_t = None;
        this.fix = None;
        this.elapsed_times = [];
        this.sq_dim = 3;
    }
    
    rt_idt2(pt, elapsed_time, disp_thresh, min_dur) {
        this.seq_x.push(pt[0])
        this.seq_y.push(pt[1])
        let cur_d = 0

        if (this.seq_x.length == (this.sq_dim + 1)) {
            cur_d = Math.max(this.seq_x) - Math.min(this.seq_x) + (Math.max(this.seq_y) - Math.min(self.seq_y));
            this.seq_x.pop(0);
            this.seq_y.pop(0);
        }

        let D = Math.abs(cur_d);
        if (D < disp_thresh) {
            if (this.fix == 1) {
                self.elapsed_times.push(elapsed_time);
                return None;
            } else {
                this.fix = 1;
                this.elapsed_times.push(elapsed_time);
                return None;
            }
        } else {
            if (this.fix == 1) {
                let dur = elapsed_time - this.elapsed_times[0];
                this.elapsed_times = [];
                this.fix = 0;
                if (dur < min_dur) {
                    return None;
                }
                fixation = { x: pt[0], y: pt[1], duration: dur, end_time: elapsed_time };
                return fixation;
            } else {
                return None;
            }
        }
    }
}