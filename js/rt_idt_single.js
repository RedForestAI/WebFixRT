const fs = require('fs');
const csv = require('csv-parser');
const math = require('mathjs');
const { Matrix } = require('ml-matrix');
const { ConfusionMatrix } = require('ml-confusion-matrix');
const Stat = require('ml-stat');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');

const { performance, PerformanceObserver } = require('perf_hooks');
const process = require('process');

function readCSV(filename) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

class RT_IDT_ALGO {
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

function profilingIDT(data) {
    const t = 2;
    const algo = new RT_IDT_ALGO();
    const SAMPLING_RATE = 50; // hz (1/1 sec)
    const delays = [];
    const rss = [];
    const heap_t = [];
    const heap_u = [];
    const external = [];

    const start = performance.now();

        data.forEach((pt, i) => {
            const elapsed_time = i / SAMPLING_RATE; // seconds
            const tic = performance.now();
            let mem_start = process.memoryUsage();
            const fix = algo.rt_idt2(pt, elapsed_time, threshold = t, min_dur = 0.05);
            // console.log(fix)
            const toc = performance.now();

            let mem = process.memoryUsage();

            let mem_end = process.memoryUsage();
            rss.push(mem_end.rss - mem_start.rss);
            heap_t.push(mem_end.heapTotal - mem_start.heapTotal);
            heap_u.push(mem_end.heapUsed - mem_start.heapUsed);
            external.push(mem_end.external - mem_end.external);

            const delay = toc - tic;
            delays.push(delay);
        });

        const end = performance.now();
        console.log(`Time taken: ${(end - start).toFixed(2)} milliseconds`);

        const memoryUsage = process.memoryUsage();
        console.log(`RSS: ${memoryUsage.rss} bytes`);
        console.log(`Heap Total: ${memoryUsage.heapTotal} bytes`);
        console.log(`Heap Used: ${memoryUsage.heapUsed} bytes`);
        console.log(`External: ${memoryUsage.external} bytes`);
}

readCSV("test.csv")
    .then((results) => {
        console.log(results.length);
        y1 = ivt2(results, v_threshold = 0.6, verbose = 1);
        let lab = results.map(row => row.label);
        y_input = lab.slice(0, -1);
        y_input = y_input.map(x => Number(x));
        profiling(results);

    })
    .catch((error) => {
        console.error('Error reading the CSV file: ', error)
    });