# WebFixRT
Real-time fixation detection on the Web

<!-- # Installation
To clone the repository, open a terminal in a directory of your choosing and use the following command:
```
git clone https://github.com/RedForestAI/reading-analysis.git
``` -->

# Installation
To clone the repository, open up VS code(or another code editor of your choosing), open a terminal and type the following command
```
npm i webfixrt
```

# Demo
Open up a terminal in your code editor and go into the demo_app directory:
```
cd demo_app
npm install
npm run dev
```

# Usage
Below is an example of how you could run our algorithm(s):
```
import { RT_IVT_ALGO, RT_IDT_ALGO } from 'webfixrt';
const algo = new RT_IVT_ALGO();
fixation = algo.rt_ivt2({x: 0, y: 0}, 0, 0.2, 0.5) # xy-coordinate, elapsed time, threshold, minimum duration
```