export class RT_IDT_ALGO {
    constructor() {
        this.seq_x = [];
        this.seq_y = [];
        this.prior_t = null;
        this.fix = null;
        this.elapsed_times = [];
        this.sq_dim = 3;
    }
    
    rt_idt2(pt, elapsed_time, disp_thresh, min_dur) {
        this.seq_x.push(parseFloat(pt.x))
        this.seq_y.push(parseFloat(pt.y))
        let cur_d = 0

        if (this.seq_x.length == (this.sq_dim + 1)) {
            cur_d = Math.max(...this.seq_x) - Math.min(...this.seq_x) + (Math.max(...this.seq_y) - Math.min(...this.seq_y));
            
            this.seq_x.shift();
            this.seq_y.shift();
        }

        let D = Math.abs(cur_d);
        // console.log('curd', cur_d);
        console.log('D', D);
        if (D < disp_thresh) {
            if (this.fix == 1) {
                this.elapsed_times.push(elapsed_time);
                return null;
            } else {
                this.fix = 1;
                this.elapsed_times.push(elapsed_time);
                return null;
            }
        } else {
            if (this.fix == 1) {
                let dur = elapsed_time - this.elapsed_times[0];
                this.elapsed_times = [];
                this.fix = 0;
                if (dur < min_dur) {
                    return null;
                }
                let fixation = { x: pt[0], y: pt[1], duration: dur, end_time: elapsed_time };
                return fixation;
            } else {
                return null;
            }
        }
    }

    profilingIDT(data) {
        const t = 2;
            const algo = new RT_IDT_ALGO();
            const SAMPLING_RATE = 50; // hz (1/1 sec)
            const delays = [];
            const rss = [];
            const heap_t = [];
            const heap_u = [];
            const external = [];
            // console.log("HIIII")
    
            const start = performance.now();
    
            data.forEach((pt, i) => {
                const elapsed_time = i / SAMPLING_RATE; // seconds
                const tic = performance.now();
                const fix = algo.rt_idt2(pt, elapsed_time, t, 0.05);
                // if (fix != null) {
                //     console.log(fix);
                // }
            // console.log(fix);
                const toc = performance.now();
    
                const delay = toc - tic;
                delays.push(delay);
            });
            
    
            // console.log(rss);
            // console.log(heap_t);
            // console.log(heap_u);
            // console.log(external);
    
            const end = performance.now();
            console.log(`Time taken: ${(end - start).toFixed(2)} milliseconds`);
            const time_per_point = data.length/(end-start);
            console.log("Time per point: ", time_per_point);
    
            // const memoryUsage = process.memoryUsage();
            // console.log(`RSS: ${memoryUsage.rss} bytes`);
            // console.log(`Heap Total: ${memoryUsage.heapTotal} bytes`);
            // console.log(`Heap Used: ${memoryUsage.heapUsed} bytes`);
            // console.log(`External: ${memoryUsage.external} bytes`);
            return {delays: delays, time_per_point: time_per_point};
    }
}

// export function profilingIDT(data) {
//     const t = 2;
//         const algo = new RT_IDT_ALGO();
//         const SAMPLING_RATE = 50; // hz (1/1 sec)
//         const delays = [];
//         const rss = [];
//         const heap_t = [];
//         const heap_u = [];
//         const external = [];
//         // console.log("HIIII")

//         const start = performance.now();

//         data.forEach((pt, i) => {
//             const elapsed_time = i / SAMPLING_RATE; // seconds
//             const tic = performance.now();
//             const fix = algo.rt_idt2(pt, elapsed_time, t, 0.05);
//             // if (fix != null) {
//             //     console.log(fix);
//             // }
//         // console.log(fix);
//             const toc = performance.now();

//             const delay = toc - tic;
//             delays.push(delay);
//         });
        

//         // console.log(rss);
//         // console.log(heap_t);
//         // console.log(heap_u);
//         // console.log(external);

//         const end = performance.now();
//         console.log(`Time taken: ${(end - start).toFixed(2)} milliseconds`);
//         const time_per_point = data.length/(end-start);
//         console.log("Time per point: ", time_per_point);

//         // const memoryUsage = process.memoryUsage();
//         // console.log(`RSS: ${memoryUsage.rss} bytes`);
//         // console.log(`Heap Total: ${memoryUsage.heapTotal} bytes`);
//         // console.log(`Heap Used: ${memoryUsage.heapUsed} bytes`);
//         // console.log(`External: ${memoryUsage.external} bytes`);
//         return {delays: delays, time_per_point: time_per_point};
// }