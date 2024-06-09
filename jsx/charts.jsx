import React, { useEffect, useState } from 'react';
import { AuthorCommitsPage } from './author.jsx';

export function Chart() {
    const [data, setData] = useState({author_commits: [], repo_commits: [], project_commits: []});
    const [loaded, setLoaded] = useState(false);

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

    /**
     * This effect will fetch three different sets of data from the API and update the
     * 'data' state with the results.
     */
    useEffect(() => {
        fetch('/api/commits/by_author/')
            .then(response => response.json())
            .then(json => setData({...data, author_commits: json}));

        fetch('/api/commits/by_repository/')
            .then(response => response.json())
            .then(json => setData({...data, repo_commits: json}));

        fetch('/api/commits/by_project/')
            .then(response => response.json())
            .then(json => setData({...data, project_commits: json}));
    }, []);

    /**
     * When a data fetch has completed this effect will be triggered and it will draw
     * the charts and tables.
     */
    useEffect(() => {
        if (window?.google?.charts) {
            window.google.charts.setOnLoadCallback(drawChart);
        }

        function drawChart() {
            setLoaded(true)
            if (window.google.visualization) {
                
                if(data?.repo_commits?.length > 0) {
                    drawRepositoryCommits(data.repo_commits)
                }
                if(data?.project_commits?.length > 0) {
                    drawProjectCommits(data.project_commits)
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
        dataGoogle.addRows(data.map((item) => [item.name, item.total, 
            item.contributors, item.lines]));

        const chart = new window.google.visualization.PieChart(document.getElementById('repo_chart_div'));
        chart.draw(dataGoogle, options);

        const table = new window.google.visualization.Table(document.getElementById('repo_table_div'));
        table.draw(dataGoogle, { showRowNumber: true, width: '100%', height: '600px' });
    }

    function drawProjectCommits(data) {
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Project');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addColumn('number', 'Active Contributors');
        dataGoogle.addColumn('number', 'Total Lines of code');
        dataGoogle.addRows(data.map((item) => [item.name, item.total, 
            item.contributors, item.lines]));

        const chart = new window.google.visualization.PieChart(document.getElementById('project_chart_div'));
        chart.draw(dataGoogle, options);

        const table = new window.google.visualization.Table(document.getElementById('project_table_div'));
        table.draw(dataGoogle, { showRowNumber: true, width: '100%', height: '600px' });
    }


    return (
        <>
            <AuthorCommitsPage data={data.author_commits} loaded={loaded} />
            
            <div className='row mt-5'>
                <h2>Activity by repository</h2>
            </div>
            <div className='row mt-5'>
                <div id="repo_chart_div" className='col-6'></div>
                <div id="repo_table_div" className='col-6'></div>
            </div>
            <div className='row mt-5'>
                <h2>Activity by Project</h2>
            </div>
            <div className='row mt-5 mb-5'>
                <div id="project_table_div" className='col-6'></div>
                <div id="project_chart_div" className='col-6'></div>
            </div>
        </>)
}


console.log('charts.js 0.01')