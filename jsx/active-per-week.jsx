import React, { useEffect, useState } from 'react';

export function ActivePerWeek({ data, loaded }) {
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (!loaded || !data || data.length === 0) return;

        // Transform data: group by week and create columns dynamically
        const weeks = new Map();
        const authors = new Set();

        // Collect all weeks and authors
        data.forEach(item => {
            if (!weeks.has(item.week)) {
                weeks.set(item.week, {});
            }
            weeks.get(item.week)[item.author] = item.commits;
            authors.add(item.author);
        });

        // Sort authors for consistent column order
        const sortedAuthors = Array.from(authors).sort();

        // Build data table
        const tableData = [['Week', ...sortedAuthors]];
        Array.from(weeks.keys()).sort().forEach(week => {
            const row = [week];
            const weekData = weeks.get(week);
            sortedAuthors.forEach(author => {
                row.push(weekData[author] || 0);
            });
            tableData.push(row);
        });

        const dataTable = new google.visualization.arrayToDataTable(tableData);

        const options = {
            title: 'Commits per Active Committer per Week (BM, RMS, PHAR)',
            curveType: 'function',
            legend: { position: 'bottom', maxLines: 3 },
            pointSize: 4,
            hAxis: {
                title: 'Week',
                slantedText: true,
                slantedTextAngle: 45,
            },
            vAxis: {
                title: 'Number of Commits',
            },
            width: 1200,
            height: 500,
        };

        const chart = new google.visualization.LineChart(
            document.getElementById('active-per-week-chart')
        );
        chart.draw(dataTable, options);
    }, [loaded, data]);

    if (!loaded) {
        return <div>Loading chart...</div>;
    }

    if (!data || data.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div id="active-per-week-chart"></div>
        </div>
    );
}

console.log('active-per-week.jsx 0.01')
