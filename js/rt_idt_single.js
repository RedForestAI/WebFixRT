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

const width = 800; // width of the canvas
const height = 600; // height of the canvas
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
Chart.register(...registerables);

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

function rt_idt(data, threshold, verbose = 0) {
    var Xs = data.map(row => row.x);
    let Ys = data.map(row => row.y);
    Xs = Xs.map(x => Number(x));
    Ys = Ys.map(y => Number(y));
    let disper = [];
    let sequence_dim = 3;
    let mvts = [];

    for (let i = 0; i < data.length - 1; ++i) {
        if (i >= sequence_dim) {
            let x = Xs.slice(i-sequence_dim, i+sequence_dim);
            let y = Ys.slice(i-sequence_dim, i+sequence_dim);
            disper.push(Math.max(...x) - Math.min(...x) + (Math.max(...y) - Math.min(...y)));
        } else {
            disper.push(0);
        }
    }

    disper = disper.map(num => Math.abs(num));
    for (let d = 0; d < disper.length; ++d) {
        if (disper[d] < threshold) {
            mvts.push(1);
        } else {
            mvts.push(2);
        }
    }
    return mvts;
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

function statisticsIDT(data, y_input) {
    const step = 2/19;
    const thresholds = math.range(0, 2 + step, step).toArray();
    // const thresholds = [0.1];
    console.log('Thresholds:', thresholds[1]);


    let fixation_recall = [];
    let fixation_precision = [];
    let fixation_f1_score = [];
    let saccade_recall = [];
    let saccade_precision = [];
    let saccade_f1_score = [];

    for (let t of thresholds) {
        let y1 = rt_idt(data, t);
        let y_pred = y1;

        let cm = ConfusionMatrix.fromLabels(y_input, y_pred);
        let mat = cm.getMatrix();
        console.log(mat);

        // Fixation calculations
        let sumf = mat[0][0] + mat[0][1];
        let Tc = mat[0][0];
        fixation_recall.push((Tc * 100) / sumf);
        console.log('Fixation recall at threshold', t, 'is', fixation_recall[fixation_recall.length - 1]);

        let sumfp = mat[0][0] + mat[1][0];
        let Tcfp = mat[0][0];
        fixation_precision.push((Tcfp * 100) / sumfp);

        let multiple_recal_prec = 2 * ((Tcfp * 100 / sumfp) * (Tc * 100 / sumf));
        let add_recall_prec = ((Tc * 100 / sumf) + (Tcfp * 100 / sumfp));
        let result_f1_score = multiple_recal_prec / add_recall_prec;
        fixation_f1_score.push(result_f1_score);

        // Saccade calculations
        let sums = mat[1][0] + mat[1][1];
        let Tcs = mat[1][1];
        saccade_recall.push((Tcs * 100) / sums);
        console.log('Saccade recall at threshold', t, 'is', saccade_recall[saccade_recall.length - 1]);

        let sum_saccP = mat[0][1] + mat[1][1];
        let Tc_saccP = mat[1][1];
        saccade_precision.push((Tc_saccP * 100) / sum_saccP);
        console.log('Saccade precision at threshold', t, 'is', saccade_precision[saccade_precision.length - 1]);

        let multiply = 2 * ((Tc_saccP * 100 / sum_saccP) * (Tcs * 100 / sums));
        let addition = (Tcs * 100 / sums) + (Tc_saccP * 100 / sum_saccP);
        saccade_f1_score.push(multiply / addition);
        console.log('Saccade F1 Score for threshold', t, 'is', saccade_f1_score[saccade_f1_score.length - 1]);
        console.log('Threshold =', t);
    }
    new_thresholds = thresholds.map(x => Number(x.toFixed(2)));
    // Plot
    const plotData = {
        labels: new_thresholds.map(String),
        datasets: [
            {
                label: 'Fixation Recall',
                data: fixation_recall,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            },
            {
                label: 'Fixation Precision',
                data: fixation_precision,
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false,
            },
            {
                label: 'Fixation F1 Score',
                data: fixation_f1_score,
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: false,
            },
            {
                label: 'Saccade Recall',
                data: saccade_recall,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
            {
                label: 'Saccade Precision',
                data: saccade_precision,
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
            },
            {
                label: 'Saccade F1 Score',
                data: saccade_f1_score,
                borderColor: 'rgba(255, 159, 64, 1)',
                fill: false,
            },
        ]
    };

    const config = {
        type: 'line',
        data: plotData,
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Velocity Threshold vs Accuracy'
                }
            },
            scales: {
                xAxes: {
                    title: {
                        display: true,
                        text: 'V_threshold [px/ms]'
                    }
                },
                yAxes: {
                    title: {
                        display: true,
                        text: 'Accuracy [%]'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                }
            }
        }
    };

    new Chart(ctx, config);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('chart.png', buffer);
    console.log('Chart saved as chart.png');
}

readCSV("test.csv")
    .then((results) => {
        console.log(results.length);
        y1 = rt_idt(results, v_threshold = 0.6, verbose = 1);
        let lab = results.map(row => row.label);
        y_input = lab.slice(0, -1);
        y_input = y_input.map(x => Number(x));
        // profiling(results);
        statisticsIDT(results, y_input);

    })
    .catch((error) => {
        console.error('Error reading the CSV file: ', error)
    });