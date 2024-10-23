import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
// import { profiling } from '../../js';
import { RT_IVT_ALGO, RT_IDT_ALGO } from 'webfixrt';
// import { statistics } from '../../js';
// import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);


const CsvLoader = ( onDataLoaded ) => {
  const [data, setData] = useState([]);
  const [graphData, setGraphData] = useState([43, 40, 50, 40, 70, 40, 45, 33, 40, 60, 40, 50, 36]);
  const [timeData, setTimeData] = useState(0);

  const [canvasData, setCanvasData] = useState({
    labels: ['1'],
    datasets: [
      {
        label: "Count",
        borderColor: "navy",
        // pointRadius: 0,
        // fill: true,
        backgroundColor: 'yellow',
        // lineTension: 0.4,
        data: [1],
        borderWidth: 1,
      },
    ],
  });

  const [canvasDataIDT, setCanvasDataIDT] = useState({
    labels: ['1'],
    datasets: [
      {
        label: "Count",
        borderColor: "navy",
        // pointRadius: 0,
        // fill: true,
        backgroundColor: 'yellow',
        // lineTension: 0.4,
        data: [1],
        borderWidth: 1,
      },
    ],
  });


  // const [d, sd] = useState([]);
  const [g, sg] = useState([43, 40, 50, 40, 70, 40, 45, 33, 40, 60, 40, 50, 36]);
  const [t, st] = useState(0);

  useEffect(() => {
    fetch('data.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            setData(results.data);
            const algo = new RT_IVT_ALGO();
            // console.log(algo.statistics(results.data, ))
            const output_ivt = algo.profiling(results.data);
            // console.log(output_ivt.time_per_point);
            setTimeData(output_ivt.time_per_point);
            const frequencyCounts = output_ivt.delays.reduce((acc, value) => {
              acc[value] = (acc[value] || 0) + 1;
              return acc;
            }, {});
            setGraphData(frequencyCounts);

            // sd(results.d);
            const al = new RT_IDT_ALGO();
            const output_idt= al.profilingIDT(results.data);
            console.log(output_idt.time_per_p);
            st(output_idt.time_per_point);
            const fq = output_idt.delays.reduce((acc, value) => {
              acc[value] = (acc[value] || 0) + 1;
              return acc;
            }, {});
            // console.log("MADE IT");
            sg(fq);
            
          },
        });
      });
  }, []);

  // Call the function with the CSV data when it is loaded
  useEffect(() => {
    // console.log("onDataLoaded type:", typeof onDataLoaded);
    if (data.length <= 0) {
      console.error("There is no data");
    }
  }, [data, onDataLoaded]);

  useEffect(() => {

    const labels = Object.keys(graphData);
    const counts = Object.values(graphData);

    const l = Object.keys(g);
    const c = Object.values(g);

    setCanvasData({
      labels: labels,
      datasets: [
        {
          label: "Count",
          borderColor: "navy",
          // pointRadius: 0,
          // fill: true,
          backgroundColor: 'yellow',
          // lineTension: 0.4,
          data: counts,
          borderWidth: 1,
        },
      ],
    })

    setCanvasDataIDT({
      labels: l,
      datasets: [
        {
          label: "Count",
          borderColor: "navy",
          // pointRadius: 0,
          // fill: true,
          backgroundColor: 'yellow',
          // lineTension: 0.4,
          data: c,
          borderWidth: 1,
        },
      ],
    })

  }, [graphData, g])

  // const labels = Object.keys(graphData);
  // const counts = Object.values(graphData);

  // const l = Object.keys(g);
  // const c = Object.values(g);

  const options = {
    scales: {
      x: {
        grid: {
          display: false,
        },
        // labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        ticks: {
          color: "red",
          font: {
            family: "Nunito",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        min: 0,
        max: 80,
        ticks: {
          stepSize: 10,
          color: "orange",
          font: {
            family: "Nunito",
            size: 12,
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: 'Frequency Count Bar Chart',
      },
    },
  };

  const graphStyle = {
    minHeight: "10rem",
    maxWidth: "540px",
    width: "100%",
    border: "1px solid #C4C4C4",
    borderRadius: "0.375rem",
    padding: "0.5rem",
  };

  return (
    <div style={graphStyle}>
      <p>IVT</p>
      {/* <Line id="home" options={options} data={canvasData} /> */}
      <Bar data={canvasData} />
      <div>
        <p>{timeData}</p>
      </div>

      <div style={graphStyle}>
        <p>IDT</p>
      {/* <Bar optisons={options} data={canvasDataIDT} /> */}
      <Bar data={canvasDataIDT} />
      <div>
        <p>{t}</p>
      </div>
      </div>
    </div>
  //   <div>
  //   <p>{timeData}</p>
  // </div>
  );
};



export default CsvLoader;
