import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
// import { profiling } from '../../js';
import { profiling, RT_IDT_ALGO } from 'webfixrt';
// import { statistics } from '../../js';
// import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);


const CsvLoader = ( onDataLoaded ) => {
  const [data, setData] = useState([]);
  const [graphData, setGraphData] = useState([43, 40, 50, 40, 70, 40, 45, 33, 40, 60, 40, 50, 36]);
  const [timeData, setTimeData] = useState(0);

  useEffect(() => {
    fetch('/data.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            setData(results.data);
            const {delays, time_per_point} = profiling(results.data);
            console.log(time_per_point);
            setTimeData(time_per_point);
            const frequencyCounts = delays.reduce((acc, value) => {
              acc[value] = (acc[value] || 0) + 1;
              return acc;
            }, {});
            setGraphData(frequencyCounts);
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

  const labels = Object.keys(graphData);
  const counts = Object.values(graphData);

  const canvasData = {
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
  };

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
      {/* <Line id="home" options={options} data={canvasData} /> */}
      <Bar optisons={options} data={canvasData} />
      <div>
        <p>{timeData}</p>
      </div>
    </div>
  //   <div>
  //   <p>{timeData}</p>
  // </div>
  );
};



export default CsvLoader;
