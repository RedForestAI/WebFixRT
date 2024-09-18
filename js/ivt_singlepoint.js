// document.addEventListener('DOMContentLoaded', () => {
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

// const results = [];

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

// Algorithm - IVT classifier - Use ChatGPT to convert to JS
// Craete a function for the algorithm, call the function the same way in cell 15
// Manually calculate the confusion matrix
// Iterate through thresholds and make the plot

// export class RT_IVT_ALGO {
//     constructor() {
//         this.prior_x = null;
//         this.prior_y = null;
//         this.prior_t = null;
//         this.isFix = null;
//         this.elapsed_times = [];
//     }

//     rt_ivt2(pt, elapsed_time, threshold, min_dur) {
//         if (this.prior_x == null && this.prior_y == null) {
//             this.prior_x = parseFloat(pt.x);
//             this.prior_y = parseFloat(pt.y);
//             this.prior_t = elapsed_time;
//             return null;
//         }

//         let dX = parseFloat(pt.x) - this.prior_x;
//         let dY = parseFloat(pt.y) - this.prior_y;

//         let v = Math.abs((dX + dY) / 2);
//         this.prior_x = parseFloat(pt.x);
//         this.prior_y = parseFloat(pt.y);

//         if (v < threshold) {
//             if (this.isFix == 1) {
//                 this.elapsed_times.push(elapsed_time);
//                 return null;
//             } else {
//                 this.isFix = 1;
//                 this.elapsed_times.push(elapsed_time);
//                 return null;
//             }
//         } else {
//             if (this.isFix == 1) {
//                 let x = this.prior_x;
//                 let y = this.prior_y;
//                 let dur = elapsed_time - this.elapsed_times[0];
//                 this.elapsed_times = []; 
//                 this.isFix = 0;
//                 if (dur < min_dur) {
//                     return null;
//                 }
//                 let fixation = { x: x, y: y, duration: dur, end_time: elapsed_time };
//                 return fixation;
//             } else {
//                 return null;
//             }
//         }
//     }
// }

function ivt2(data, v_threshold, verbose = 0) {
    var Xs = data.map(row => row.x);
    let Ys = data.map(row => row.y);
    let prior_x = null;
    let prior_y = null;

    let diffX = [];
    let diffY = [];
    let velocity = [];
    let thresh = [];

    for (let i = 0; i < Xs.length; i++) {
        let x = Xs[i];
        let y = Ys[i];

        if (prior_x === null && prior_y === null) {
            prior_x = x;
            prior_y = y;
            continue;
        }

        let dX = x - prior_x;
        let dY = y - prior_y;
        diffX.push(dX);
        diffY.push(dY);

        let v = Math.abs((dX + dY) / 2);
        velocity.push(v);

        if (v < v_threshold) {
            thresh.push(1);
        } else {
            thresh.push(2);
        }

        prior_x = x;
        prior_y = y;
    }
    return [thresh, velocity];
}

function statistics(data, y_input) {
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
        let y1 = ivt2(data, t)[0];
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

// export function profiling(data) {
//     const t = 0.1;
//         const algo = new RT_IVT_ALGO();
//         const SAMPLING_RATE = 50; // hz (1/1 sec)
//         const delays = [];
//         const rss = [];
//         const heap_t = [];
//         const heap_u = [];
//         const external = [];

//         const start = performance.now();

//         data.forEach((pt, i) => {
//             const elapsed_time = i / SAMPLING_RATE; // seconds
//             const tic = performance.now();
//             let mem_start = process.memoryUsage();
//             const fix = algo.rt_ivt2(pt, elapsed_time, threshold = t, min_dur = 0.05);
//             // console.log(fix)
//             const toc = performance.now();

//             let mem = process.memoryUsage();

//             let mem_end = process.memoryUsage();
//             rss.push(mem_end.rss - mem_start.rss);
//             heap_t.push(mem_end.heapTotal - mem_start.heapTotal);
//             heap_u.push(mem_end.heapUsed - mem_start.heapUsed);
//             external.push(mem_end.external - mem_end.external);

//             const delay = toc - tic;
//             delays.push(delay);
//         });

//         // console.log(rss);
//         // console.log(heap_t);
//         // console.log(heap_u);
//         // console.log(external);

//         const end = performance.now();
//         console.log(`Time taken: ${(end - start).toFixed(2)} milliseconds`);

//         const memoryUsage = process.memoryUsage();
//         console.log(`RSS: ${memoryUsage.rss} bytes`);
//         console.log(`Heap Total: ${memoryUsage.heapTotal} bytes`);
//         console.log(`Heap Used: ${memoryUsage.heapUsed} bytes`);
//         console.log(`External: ${memoryUsage.external} bytes`);
// }

readCSV("test.csv")
    .then((results) => {
        console.log(results.length);
        y1 = ivt2(results, v_threshold = 0.6, verbose = 1);
        let lab = results.map(row => row.label);
        y_input = lab.slice(0, -1);
        y_input = y_input.map(x => Number(x));
        // profiling(results);
        statistics(results, y_input);

        // const t = 0.1;
        // const algo = new RT_IVT_ALGO();
        // const SAMPLING_RATE = 50; // hz (1/1 sec)
        // const delays = [];
        // const rss = [];
        // const heap_t = [];
        // const heap_u = [];
        // const external = [];

        // const start = performance.now();

        // results.forEach((pt, i) => {
        //     const elapsed_time = i / SAMPLING_RATE; // seconds
        //     const tic = performance.now();
        //     let mem_start = process.memoryUsage();
        //     const fix = algo.rt_ivt2(pt, elapsed_time, threshold = t, min_dur = 0.05);
        //     // console.log(fix)
        //     const toc = performance.now();

        //     let mem = process.memoryUsage();

        //     let mem_end = process.memoryUsage();
        //     rss.push(mem_end.rss - mem_start.rss);
        //     heap_t.push(mem_end.heapTotal - mem_start.heapTotal);
        //     heap_u.push(mem_end.heapUsed - mem_start.heapUsed);
        //     external.push(mem_end.external - mem_end.external);

        //     const delay = toc - tic;
        //     delays.push(delay);
        // });

        // // console.log(rss);
        // // console.log(heap_t);
        // // console.log(heap_u);
        // // console.log(external);

        // const end = performance.now();
        // console.log(`Time taken: ${(end - start).toFixed(2)} milliseconds`);

        // const memoryUsage = process.memoryUsage();
        // console.log(`RSS: ${memoryUsage.rss} bytes`);
        // console.log(`Heap Total: ${memoryUsage.heapTotal} bytes`);
        // console.log(`Heap Used: ${memoryUsage.heapUsed} bytes`);
        // console.log(`External: ${memoryUsage.external} bytes`);

    })
    .catch((error) => {
        console.error('Error reading the CSV file: ', error)
    });

// export {profiling}


