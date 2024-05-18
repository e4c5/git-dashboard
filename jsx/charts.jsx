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
                let others = ["Others", 0];
                let total = 0;

                for(let i=0; i<data.length; i++) {
                    total += data[i].total;
                    if(i < 7) {
                        dataGoogle.addRow([data[i].author.name, data[i].total]);
                    }
                    else {
                        others[1] += data[i].total;
                    }
                }
                if(others[1] > 0) {
                    dataGoogle.addRow(others);
                }

                const options = {
                    title: `Author Commits (Total ${total})`,
                    width: 800,
                    height: 600,
                    pieSliceText: 'value',
                    tooltip: { trigger: 'selection' }
                };

                const chart = new window.google.visualization.PieChart(document.getElementById('chart_div'));
                chart.draw(dataGoogle, options);
            }
        }
    }, [data]);

    return <div id="chart_div"></div>;
}