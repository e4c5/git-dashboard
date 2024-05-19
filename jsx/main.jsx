//npx babel --watch jsx --out-dir analyzer/static/js/ --presets react-app/dev 
import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { Chart } from './charts.jsx';

const div = document.getElementById('root')
const root = ReactDOM.createRoot(div) 

function Hello() {
    return (<>
            <h1>Git Dashboard</h1>
            <p className="p-3">Edsger Dijkstra on lines of code as a measure: </p>
            <p className="p-3">if we wish to count lines of code, we should not regard them as "lines produced" but 
                as "lines spent": the current conventional wisdom is so foolish as to book that count on the wrong side of the ledger.</p>
        </>)
}

root.render(<>
    <Hello/>
    <Chart/>
</>)

console.log('main.js 0.02')