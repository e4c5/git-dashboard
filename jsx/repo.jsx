import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams, useNavigate, useLocation} from 'react-router-dom';

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
 * Renders a list of repositories with their activity details.
 * 
 * This component is used instead of directly displaying the <Routes> with in the
 * Repositories component. This is because the useLocation hook is needed to trigger
 * a repaint of the google chart on back button click.
 * 
 * @component
 * @param {Object[]} data - The array of repository data.
 * @param {boolean} loaded - Indicates whether the data has been loaded.
 * @returns {JSX.Element} - The rendered component.
 */
function Body({data, loaded, config}) {
    const [visit, setVisit] = useState(0)
    const location = useLocation();
    
    useEffect(() => { setVisit(v => v + 1) }, [location])

    return(<Routes>
        <Route path="/" element = {Contributors({data, loaded, visit}) } />
        <Route path="/:id" element={<RepoCommits  config={config}/>} />
    </Routes>)
}

/**
 * Renders a list of commits for a specific repository.
 */
function RepoCommits({config}) {
    const { id } = useParams();
    const [repo, setRepo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(id) {
            fetch(`/api/repositories/${id}?detail=true`)
                .then(response => response.json())
                .then(data => setRepo(data));
        }
    }, [id]);

    function get_link(commit) {
        if(config && repo?.project) {
            return (
                <a href={`${config['url_pattern']}projects/${repo.project.name}/repos/${repo.name}/commits/${commit.hash}`}
                    target="_blank">
                    {commit.hash.substring(0,6)}
                </a>
            )
        }
        return commit.hash.substring(0,6);

    }
    if (repo) {
        return (
            <div className='col-md6  component'>
                <div className="d-flex justify-content-between align-items-center">
                    <h3>Activity for {repo.name}</h3>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        <i className="fa fa-arrow-left"></i> Back
                    </button>
                </div>
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Author</th>
                            <th>Hash</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repo.commits?.map(commit => (
                            <tr key={commit.hash}>
                                <td className="text-nowrap">{new Date(commit.timestamp).toLocaleString()}</td>
                                <td className="text-nowrap">{commit.author.name}</td>
                                <td>{ get_link(commit) }</td>
                                <td>{commit.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}


function Contributors({data, loaded, visit}) {
    const chartRef = useRef(null);
    useEffect(() => {
        if (loaded && window?.google?.charts && data && chartRef.current) {
            drawRepoCommits(data);
        }
    },[data, loaded, visit]);


    function drawRepoCommits(data) {
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Repository');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addColumn('number', 'Total Contributors');
        dataGoogle.addColumn('number', 'Total Lines of code');
        dataGoogle.addRows(data.map((item) => [item.name, item.commits, 
            item.contributors, item.lines]));

        const chart = new window.google.visualization.PieChart(chartRef.current);
        chart.draw(dataGoogle, options);
    }

    
    return (<>
                <div className='row mt-5'>
                    <h2>Activity by repository</h2>
                </div>
                <div className='row mt-5 mb-5'>
                    <div id="project_table_div" className='col-6  component'>
                        <table className='table table-striped'>
                            <thead>
                                <tr><th>Repo</th><th>Contributors</th>
                                <th>Commits</th><th>Lines</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(repo => (
                                    <tr key={repo.id}>
                                        <td>
                                            <Link to={`/${repo.id}`}>{repo.name}</Link>
                                        </td>
                                        <td>{repo.contributors}</td>
                                        <td>{repo.commits}</td>
                                        <td  className="text-end">{repo.lines.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div ref={chartRef} className='col-6'></div>
                </div>
            </>
    )
}

export function Repositories({ data, loaded, config }) {

    return (
        <Router>
            <Body data={data} loaded={loaded}  config={config}/>
        </Router>
    );
}
