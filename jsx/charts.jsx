import React, { useEffect, useState } from 'react';

export function Chart() {
    const [data, setData] = useState({author_commits: [], repo_commits: []});

    useEffect(() => {
        fetch('/api/commits/author_commits/')
            .then(response => response.json())
            .then(json => setData({...data, author_commits: json}));

        fetch('/api/commits/repository_commits/')
            .then(response => response.json())
            .then(json => setData({...data, repo_commits: json}));
    }, []);

    useEffect(() => {
        if (window?.google?.charts) {
            window.google.charts.setOnLoadCallback(drawChart);
        }

        function drawChart() {
            if (window.google.visualization) {
                if(data?.author_commits?.length > 0) {
                    drawAuthorCommits(data.author_commits);
                }
                if(data?.repo_commits.length > 0) {
                    console.log('should draw')
                    drawRepositoryCommits(data.repo_commits)
                }
            }
        }
    }, [data]);

    function drawRepositoryCommits(data) {
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Repository');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addColumn('number', 'Total Contributors');
        dataGoogle.addColumn('number', 'Total Lines of code');
        dataGoogle.addRows(data.map((item) => [item.repository.name, item.total, 
            item.repository.contributor, item.repository.lines]));

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

        const chart = new window.google.visualization.PieChart(document.getElementById('repo_chart_div'));
        chart.draw(dataGoogle, options);

        const table = new window.google.visualization.Table(document.getElementById('repo_table_div'));
        table.draw(dataGoogle, { showRowNumber: true, width: '100%', height: '600px' });
    }

    function drawAuthorCommits(data) {
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

        const chart = new window.google.visualization.PieChart(document.getElementById('author_chart_div'));
        chart.draw(dataGoogle, options);

        const table = new window.google.visualization.Table(document.getElementById('author_table_div'));
        table.draw(dataGoogle, { showRowNumber: true, width: '100%', height: '600px' });
    }

    return (
        <>
            <div className='row mt-1'>
                <h2>Activity by contributor</h2>
            </div>
            <div className='row mt-5'>
                <div id="author_table_div" className='col-6'></div>
                <div id="author_chart_div" className='col-6'></div>
            </div>
            <div className='row mt-5'>
                <h2>Activity by repository</h2>
            </div>
            <div className='row mt-5'>
                <div id="repo_chart_div" className='col-6'></div>
                <div id="repo_table_div" className='col-6'></div>
            </div>
        </>)
}


console.log('charts.js 0.01')