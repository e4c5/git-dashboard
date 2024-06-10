import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams} from 'react-router-dom';

const options = {
    width: 600,
    height: 600,
    pieSliceText: 'value',
    sliceVisibilityThreshold: 0.025,
    chartArea: {
        left: 100,
        top: 75,
        width: '100%',
        height: '100%'
    },
    legend: {
        alignment: 'center',
        position: 'top'
    }
};

