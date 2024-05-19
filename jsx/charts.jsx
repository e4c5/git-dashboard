import React, { useEffect, useState } from 'react';

export function Chart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('/api/commits/author_commits/')
            .then(response => response.json())
            .then(data => setData(data));
    }, []);

    useEffect(() => {
        if (window?.google?.charts) {
            window.google.charts.setOnLoadCallback(drawChart);
        }

        function drawChart() {
            if (window.google.visualization) {
                const dataGoogle = new window.google.visualization.DataTable();
                dataGoogle.addColumn('string', 'Author');
                dataGoogle.addColumn('number', 'Commits');
                dataGoogle.addRows(data.map((item) => [item.author.name, item.total]));
        
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
        
                const chart = new window.google.visualization.PieChart(document.getElementById('chart_div'));
                chart.draw(dataGoogle, options);
        
                const table = new window.google.visualization.Table(document.getElementById('table_div'));
                table.draw(dataGoogle, {showRowNumber: true, width: '100%', height: '600px'});
            }
        }
    }, [data]);

    return (
        <>
            <div className='row'>
                <h2>Activity by contributor</h2>
            </div>
            <div className='row'>
                <div id="table_div" className='col-6'></div>
                <div id="chart_div" className='col-6'></div>
            </div>
        </>)
}