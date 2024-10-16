import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
// import { profiling } from '../../js';
import { RT_IVT_ALGO, RT_IDT_ALGO } from 'webfixrt';
// import { statistics } from '../../js';
// import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const names = ['TH20_trial1_labelled_MN', 'TH20_trial1_labelled_RA',
  'TH34_img_Europe_labelled_MN', 'TH34_img_Europe_labelled_RA',
  'TH34_img_vy_labelled_MN', 'TH34_img_vy_labelled_RA',
  'TH34_video_BergoDalbana_labelled_MN',
  'TH34_video_BergoDalbana_labelled_RA',
  'TH38_video_dolphin_fov_labelled_MN', 'TH38_video_dolphin_fov_labelled_RA',
  'TL20_img_konijntjes_labelled_MN', 'TL20_img_konijntjes_labelled_RA',
  'TL22_trial17_labelled_MN', 'TL22_trial17_labelled_RA',
  'TL28_img_konijntjes_labelled_MN', 'TL28_img_konijntjes_labelled_RA',
  'TL30_video_triple_jump_labelled_MN', 'TL30_video_triple_jump_labelled_RA',
  'UH21_img_Rome_labelled_MN', 'UH21_img_Rome_labelled_RA',
  'UH21_trial17_labelled_MN', 'UH21_trial17_labelled_RA',
  'UH21_trial1_labelled_MN', 'UH21_trial1_labelled_RA',
  'UH21_video_BergoDalbana_labelled_MN',
  'UH21_video_BergoDalbana_labelled_RA', 'UH25_trial1_labelled_MN',
  'UH25_trial1_labelled_RA', 'UH27_img_vy_labelled_MN',
  'UH27_img_vy_labelled_RA', 'UH29_img_Europe_labelled_MN',
  'UH29_img_Europe_labelled_RA', 'UH29_video_dolphin_fov_labelled_MN',
  'UH29_video_dolphin_fov_labelled_RA', 'UH33_img_vy_labelled_MN',
  'UH33_img_vy_labelled_RA', 'UH33_trial17_labelled_MN',
  'UH33_trial17_labelled_RA', 'UH47_img_Europe_labelled_MN',
  'UH47_img_Europe_labelled_RA', 'UH47_video_BergoDalbana_labelled_MN',
  'UH47_video_BergoDalbana_labelled_RA', 'UL23_img_Europe_labelled_MN',
  'UL23_img_Europe_labelled_RA', 'UL23_video_triple_jump_labelled_MN',
  'UL23_video_triple_jump_labelled_RA', 'UL27_trial17_labelled_MN',
  'UL27_trial17_labelled_RA', 'UL27_video_triple_jump_labelled_MN',
  'UL27_video_triple_jump_labelled_RA', 'UL31_img_konijntjes_labelled_MN',
  'UL31_img_konijntjes_labelled_RA', 'UL31_video_triple_jump_labelled_MN',
  'UL31_video_triple_jump_labelled_RA', 'UL39_img_konijntjes_labelled_MN',
  'UL39_img_konijntjes_labelled_RA', 'UL39_trial1_labelled_MN',
  'UL39_trial1_labelled_RA', 'UL43_img_Rome_labelled_MN',
  'UL43_img_Rome_labelled_RA']

const ScanPathPlot = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [name, setName] = useState(names[0]);
  const [fixationPointsIVT, setFixationPointsIVT] = useState([]);
  const [fixationPointsIDT, setFixationPointsIDT] = useState([]);

  useEffect(() => {
    fetch('/test_name.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
          const algo = new RT_IVT_ALGO();
          const algo1 = new RT_IDT_ALGO();
          const parsedData = results.data
            .filter(row => row.name === name)  // Filtering rows based on the 'name' or any other identifier
            .map(row => ({
              x: row.x, 
              y: row.y,
            }));
            // console.log('PD', parsedData);
            let i = 0;
            const fixationDataIVT = parsedData.map((point) => {
              const fixation = algo.rt_ivt2(point, i/50, 0.1, 0.05); 
              ++i;
              return fixation ? { x: point.x, y: point.y } : null;   // Only return if it's a fixation
            }).filter(point => point !== null);

            i = 0;
            const fixationDataIDT = parsedData.map((point) => {
              const fixation1 = algo1.rt_idt2(point, i/50, 8, 0.05);  
              ++i;
              console.log('point', point);
              return fixation1 ? { x: point.x, y: point.y } : null;   // Only return if it's a fixation
            }).filter(point => point !== null);
            
            setDataPoints(parsedData);
            setFixationPointsIVT(fixationDataIVT);
            setFixationPointsIDT(fixationDataIDT);
            console.log('idt', fixationDataIDT);
            // console.log('fixation', fixationData);
          },
        });
      });
  }, [name]);

  const canvasRef = useRef(null);
  
  const draw = (ctx, points, frameCount, color, circleSize=6) => {
    if (frameCount === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.beginPath();
    ctx.strokeStyle = color; // Line color
    ctx.lineWidth = 2;

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else if (index <= frameCount) {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    points.forEach((point, index) => {
      if (index <= frameCount) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, circleSize, 0, 2 * Math.PI); // Adjust radius as needed
        ctx.fill();
      }
    });
  };
  
  useEffect(() => {

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    let plottedIVTPoints = [];
    let plottedIDTPoints = [];

    const findMinMaxValues = () => {
      const allPoints = [
        ...dataPoints,
        ...fixationPointsIVT,
        ...fixationPointsIDT,
      ];
      const minX = Math.min(...allPoints.map((p) => p.x));
      const maxX = Math.max(...allPoints.map((p) => p.x));
      const minY = Math.min(...allPoints.map((p) => p.y));
      const maxY = Math.max(...allPoints.map((p) => p.y));
      return { minX, maxX, minY, maxY };
    };

    // Get the scaling factors based on min/max values
    const scalePoint = (point, minX, maxX, minY, maxY) => {
      const scaledX = ((point.x - minX) / (maxX - minX)) * canvas.width;
      const scaledY = ((point.y - minY) / (maxY - minY)) * canvas.height;
      return { x: scaledX, y: scaledY };
    };

    const { minX, maxX, minY, maxY } = findMinMaxValues();

    const findMatchingFixation = (fixations, dataPoint) => {
      return fixations.find(fixation => fixation.x === dataPoint.x && fixation.y === dataPoint.y);
  };
    
    //Our draw came here
    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // NON-SCALED
      // Draw raw data points up to the current frame
      draw(context, dataPoints.slice(0, frameCount + 1), frameCount, "#0000FF", 3);

      const ivtFixation = findMatchingFixation(fixationPointsIVT, dataPoints[frameCount]);
        if (ivtFixation) {
            plottedIVTPoints.push(ivtFixation);  // Store matched IVT point
        }

        // Check for matching IDT point and store it
        const idtFixation = findMatchingFixation(fixationPointsIDT, dataPoints[frameCount]);
        if (idtFixation) {
            plottedIDTPoints.push(idtFixation);  // Store matched IDT point
        }

        // Draw all previously stored IVT points (cumulative)
        draw(context, plottedIVTPoints, frameCount, '#FF0000');

        // Draw all previously stored IDT points (cumulative)
        draw(context, plottedIDTPoints, frameCount, '#AAFF00');
      // draw(context, dataPoints, frameCount, '#0000FF');
      // draw(context, fixationPointsIVT, frameCount, '#FF0000');
      // draw(context, fixationPointsIDT, frameCount, '#9400D3');
      if (frameCount < dataPoints.length - 1) {
        frameCount++;
      } else {
        frameCount = 0;
        plottedIVTPoints = [];
        plottedIDTPoints = [];
      }

      // const scaledDataPoints = dataPoints.slice(0, frameCount + 1).map(p => scalePoint(p, minX, maxX, minY, maxY));

      // // Draw raw data points up to the current frame
      // draw(context, scaledDataPoints, frameCount, "#0000FF");

      // const ivtFixation = findMatchingFixation(fixationPointsIVT, dataPoints[frameCount]);
      //   if (ivtFixation) {
      //       const scaledIVT = scalePoint(ivtFixation, minX, maxX, minY, maxY);
      //       plottedIVTPoints.push(scaledIVT);  // Store matched IVT point
      //   }

      //   // Check for matching IDT point and store it
      //   const idtFixation = findMatchingFixation(fixationPointsIDT, dataPoints[frameCount]);
      //   if (idtFixation) {
      //       const scaledIDT = scalePoint(idtFixation, minX, maxX, minY, maxY);
      //       plottedIDTPoints.push(scaledIDT);  // Store matched IDT point
      //   }

      //   // Draw all previously stored IVT points (cumulative)
      //   draw(context, plottedIVTPoints, frameCount, '#FF0000');

      //   // Draw all previously stored IDT points (cumulative)
      //   draw(context, plottedIDTPoints, frameCount, '#9400D3');
      // // draw(context, dataPoints, frameCount, '#0000FF');
      // // draw(context, fixationPointsIVT, frameCount, '#FF0000');
      // // draw(context, fixationPointsIDT, frameCount, '#9400D3');
      // if (frameCount < dataPoints.length - 1) {
      //   frameCount++;
      // } else {
      //   frameCount = 0;
      //   plottedIVTPoints = [];
      //   plottedIDTPoints = [];
      // }
      animationFrameId = window.requestAnimationFrame(render);
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [dataPoints, fixationPointsIVT, fixationPointsIDT]);
  
  
  // return <canvas ref={canvasRef} width={500} height={500} style={{border: "1px solid black"}} />
  return <>
    <select
  value={name}
  onChange={(e) => setName(e.target.value)}
  >
  {names.map((option) => (
  <option key={option} value={option}>
  {option}
  </option>
  ))}
  </select>
  <canvas ref={canvasRef} width={700} height={700} style={{border: "1px solid black"}} />
  </>
};



export default ScanPathPlot;
