import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams, useNavigate} from 'react-router-dom';

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
        dataGoogle.addRows(data.map((item) => [item.name, item.commits, 
            item.contributors, item.lines]));

        const chart = new window.google.visualization.PieChart(chartRef.current);
        chart.draw(dataGoogle, options);
    }

    return (
                <div className='row mt-5 mb-5'>
                    <h2>Activity by Project</h2>
                    <div id="project_table_div" className='col-6  component'>
                        <table className='table table-striped'>
                            <thead>
                                <tr><th>Project</th><th>Contributors</th>
                                <th>Commits</th><th>Lines</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(project => (
                                    <tr key={project.id}>
                                        <td>
                                            <Link to={`/${project.id}`}>{project.name}</Link>
                                        </td>
                                        <td className="text-end">{project.contributors.toLocaleString()}</td>
                                        <td className="text-end">{project.commits.toLocaleString()}</td>
                                        <td className="text-end">{project.lines.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div ref={chartRef} className='col-6'></div>
                </div>
    )
}

function ProjectCommits() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(id) {
            fetch(`/api/projects/${id}?detail=true`)
                .then(response => response.json())
                .then(data => setProject(data));
        }
    }, [id]);

    if (project) {
        return (
            <div className='col-md6  component'>
                <div className="d-flex justify-content-between align-items-center">
                    <h3>Activity for {project.name}</h3>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        <i className="fa fa-arrow-left"></i> Back
                    </button>
                </div>
                <table className='table table-striped'>
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
                                <td className="text-nowrap">{new Date(commit.timestamp).toLocaleString()}</td>
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
