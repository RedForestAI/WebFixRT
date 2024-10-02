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

  useEffect(() => {
    fetch('/test_name.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
          const parsedData = results.data
            .filter(row => row.name === name)  // Filtering rows based on the 'name' or any other identifier
            .map(row => ({
              x: row.x, 
              y: row.y,
            }));
            setDataPoints(parsedData);
          },
        });
      });
  }, [name]);

  const canvasRef = useRef(null);
  
  const draw = (ctx, points, frameCount) => {
    if (frameCount === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#0000FF'; // Line color
    ctx.lineWidth = 2;

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else if (index <= frameCount) {
        ctx.lineTo(point.x, point.y);
      }
      //   ctx.fillStyle = '#000000';
      //   ctx.beginPath();
      //   ctx.arc(point.x, point.y, 10, 0, 2*Math.PI);
      //   ctx.fill();
      // }
    });
    ctx.stroke();
    points.forEach((point, index) => {
      if (index <= frameCount) {
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); // Adjust radius as needed
        ctx.fill();
      }
    });
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // ctx.fillStyle = '#000000'
    // ctx.beginPath()
    // ctx.arc(x, y, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
    // // ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
    // ctx.fill()
  };
  
  useEffect(() => {
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;
    
    //Our draw came here
    const render = () => {
      // frameCount++
      draw(context, dataPoints, frameCount);
      if (frameCount < dataPoints.length - 1) {
        frameCount++;
      } else {
        frameCount = 0;
      }
      animationFrameId = window.requestAnimationFrame(render);
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [dataPoints]);
  
  
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
