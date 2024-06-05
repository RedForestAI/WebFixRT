const fs = require('fs');
const csv = require('csv-parser');
const math = require('mathjs');
const { Matrix } = require('ml-matrix');
const { ConfusionMatrix } = require('ml-confusion-matrix');
const Stat = require('ml-stat');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');

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
//     fs.createReadStream(filename)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//         // console.log(results);
//         // console.log(results[0])
//   });
}

// Algorithm - IVT classifier - Use ChatGPT to convert to JS
// Craete a function for the algorithm, call the function the same way in cell 15
// Manually calculate the confusion matrix
// Iterate through thresholds and make the plot

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
        // console.log("x: " + x + " y: " + y + " prior_x: " + prior_x + " prior_y: " + prior_y + " dX: " + dX + " dY: " + dY);

        prior_x = x;
        prior_y = y;
    }
    // console.log("thresh: ", thresh);
    return [thresh, velocity];
}

function statistics(data, y_input) {
    const step = 2/19;
    const thresholds = math.range(0, 2 + step, step).toArray();
    // const thresholds = [0.1];
    console.log('Thresholds:', thresholds[1]);

    // const { precision, recall, f1Score } = Stat.metrics;

    let fixation_recall = [];
    let fixation_precision = [];
    let fixation_f1_score = [];
    let saccade_recall = [];
    let saccade_precision = [];
    let saccade_f1_score = [];
    let cohen_kappa = [];

    for (let t of thresholds) {
        let y1 = ivt2(data, t)[0];
        // console.log("y1:", y_input)
        let y_pred = y1;
        // console.log('Length of data:', data.length);
        // console.log('Length of y1:', y1.length);
        // console.log('Length of y_pred:', y_pred);
        // console.log('Length of y_input:', y_input);

        let cm = ConfusionMatrix.fromLabels(y_input, y_pred);
        let mat = cm.getMatrix();
        // console.log('Classification Report for threshold', t, cm.getClassificationReport());
        // console.log('Cohen Kappa for threshold', t, cm.getCohenKappa());

        // Fixation calculations
        // let sumf = cm.get(0, 0) + cm.get(0, 1);
        let sumf = mat[0][0] + mat[0][1];
        // let Tc = cm.get(0, 0);
        let Tc = mat[0][0];
        // console.log("Tc: " + Tc + " sumf: " + sumf);
        fixation_recall.push((Tc * 100) / sumf);
        console.log('Fixation recall at threshold', t, 'is', fixation_recall[fixation_recall.length - 1]);

        // let sumfp = cm.get(0, 0) + cm.get(1, 0);
        let sumfp = mat[0][0] + mat[1][0];
        // let Tcfp = cm.get(0, 0);
        let Tcfp = mat[0][0];
        fixation_precision.push((Tcfp * 100) / sumfp);
        // console.log('Fixation precision at threshold', t, 'is', fixation_precision[fixation_precision.length - 1]);

        let multiple_recal_prec = 2 * ((Tcfp * 100 / sumfp) * (Tc * 100 / sumf));
        let add_recall_prec = ((Tc * 100 / sumf) + (Tcfp * 100 / sumfp));
        let result_f1_score = multiple_recal_prec / add_recall_prec;
        fixation_f1_score.push(result_f1_score);
        // console.log('Fixation F1 Score for threshold', t, 'is', fixation_f1_score[fixation_f1_score.length - 1]);

        // Saccade calculations
        // let sums = cm.get(1, 0) + cm.get(1, 1);
        let sums = mat[1][0] + mat[1][1];
        // let Tcs = cm.get(1, 1);
        let Tcs = mat[1][1];
        saccade_recall.push((Tcs * 100) / sums);
        console.log('Saccade recall at threshold', t, 'is', saccade_recall[saccade_recall.length - 1]);

        // let sum_saccP = cm.get(0, 1) + cm.get(1, 1);
        let sum_saccP = mat[0][1] + mat[1][1];
        // let Tc_saccP = cm.get(1, 1);
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
    // console.log("fixation_recall: ", fixation_recall);
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
        y1 = ivt2(results, v_threshold = 0.6, verbose = 1);
        let lab = results.map(row => row.label);
        y_input = lab.slice(0, -1);
        y_input = y_input.map(x => Number(x));
        // console.log(lab.length);
        // console.log(y_input);

        // confusion matrix and more statistical methods
        statistics(results, y_input);
    })
    .catch((error) => {
        console.error('Error reading the CSV file: ', error)
    });

