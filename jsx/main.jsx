//npx babel --watch jsx --out-dir analyzer/static/js/ --presets react-app/dev 
import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { Chart } from './charts.jsx';

const div = document.getElementById('root')
const root = ReactDOM.createRoot(div) 

function Hello() {
    return <h1>Hello World</h1>
}

root.render(<>
    <Hello/>
    <Chart/>
</>)

console.log('main.js 0.01')