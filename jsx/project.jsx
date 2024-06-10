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

function Contributors({data, loaded}) {
    const chartRef = useRef(null);
    
    useEffect(() => {
        if (loaded && window?.google?.charts && data) {
            drawProjectCommits(data);
        }
    },[data, loaded]);


    function drawProjectCommits(data) {
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Project');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addColumn('number', 'Active Contributors');
        dataGoogle.addColumn('number', 'Total Lines of code');
        dataGoogle.addRows(data.map((item) => [item.name, item.total, 
            item.contributors, item.lines]));

        const chart = new window.google.visualization.PieChart(chartRef.current);
        chart.draw(dataGoogle, options);
    }

    return (<>
                <div className='row mt-5'>
                    <h2>Activity by Project</h2>
                </div>
                <div className='row mt-5 mb-5'>
                    <div id="project_table_div" className='col-6'>
                        {data.map(project => (
                            <div key={project.id} className='row'>
                                <div className='col-6'>
                                    <Link to={`/${project.id}`}>{project.name}</Link>
                                </div>
                                <div className='col-6'>
                                    {project.total} commits
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={chartRef} className='col-6'></div>
                </div>
            </>
    )
}

function ProjectCommits() {
    const { id } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        if(id) {
            fetch(`/api/projects/${id}?detail=true`)
                .then(response => response.json())
                .then(data => setProject(data));
        }
    }, [id]);

    if (project) {
        return (
            <div>
                <h3>Activity for {project.name}</h3>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Hash</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.commits.map(commit => (
                            <tr key={commit.hash}>
                                <td>{new Date(commit.timestamp).toLocaleString()}</td>
                                <td>{commit.hash.substring(0,6)}</td>
                                <td>{commit.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export function Projects({ data, loaded }) {
    return (
        <Router>
            <Routes>
                <Route path="/" element = {Contributors({data, loaded}) } />
                <Route path="/:id" element={<ProjectCommits/>} />
            </Routes>
        </Router>
    );
}
