//npx babel --watch jsx --out-dir analyzer/static/js/ --presets react-app/dev 
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart } from './charts.jsx';

const div = document.getElementById('root')
const root = createRoot(div) 

function Hello() {
    return (<>
            <h1>Git Dashboard</h1>
            
            <p>if we wish to count lines of code, we should not regard them as "lines produced" but 
                as "lines spent": the current conventional wisdom is so foolish as to book that count on the wrong side of the ledger.</p>
            <p className="ps-4">Edsger Dijkstra</p>
        </>)
}

root.render(<>
    <Hello/>
    <Chart/>
</>)

console.log('main.js 0.02')