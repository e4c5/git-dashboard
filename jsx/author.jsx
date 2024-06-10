import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams,useNavigate, useLocation} from 'react-router-dom';

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
 * Authors component (below). This is because the useLocation hook is needed to trigger
 * a repaint of the google chart on back button click.
 * 
 * @component
 * @param {Object[]} data - The array of repository data.
 * @param {boolean} loaded - Indicates whether the data has been loaded.
 * @returns {JSX.Element} - The rendered component.
 */
function Body({data, loaded}) {
    const [visit, setVisit] = useState(0)
    const location = useLocation();
    
    useEffect(() => { setVisit(v => v + 1) }, [location])

    return(<Routes>
        <Route path="/" element = {AuthorCommitsTable({data, loaded, visit}) } />
        <Route path="/:id" element={<AuthorCommits/>} />
    </Routes>)
}


/**
 * Renders a table displaying the author and their number of commits.
 * @param {Object} props - The component props.
 * @param {Array} props.data - The data containing author information and commit counts.
 * @returns {JSX.Element} - The rendered table component.
 */
export function AuthorCommitsTable({ data, loaded, visit }) {
    const chartRef = useRef(null);
    useEffect(() => {
        if (loaded && window?.google?.charts && data && chartRef.current) {
            drawAuthorCommits(data);
        }
    },[data, loaded, visit]);


    function drawAuthorCommits(data) {
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Author');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addRows(data.map((item) => [item.name, item.commits]));

        const chart = new window.google.visualization.PieChart(chartRef.current);
        chart.draw(dataGoogle, options);

    }

    return (
        <>
            <div className='row mt-1'>
                <h2>Activity by contributor</h2>
            </div>
            <div className='row mt-5'>
                <div id="author_table_div" className='col-6  component'>
                    <table className='table table-striped'>
                        <thead>
                            <tr>
                                <th>Author</th>
                                <th>Commits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item) => (
                                <tr key={item.name}>
                                    <td>
                                        <Link to={`/${item.id}`}>
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td>{item.commits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                    
                </div>
                <div ref={chartRef} className='col-6'></div>
            </div>
        </>
    );
}


function AuthorCommits() {
    const { id } = useParams();
    const [commits, setCommits] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(id) {
            fetch(`/api/authors/${id}?detail=true`)
                .then(response => response.json())
                .then(data => setCommits(data));
        }
    }, [id]);

    if (commits) {
        return (
            <div className='col-md6  component'>
                
                <div className="d-flex justify-content-between align-items-center">
                    <h3>Activity for {commits.name}</h3>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        <i className="fa fa-arrow-left"></i> Back
                    </button>
                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Hash</th>
                            <th className="text-center">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commits.commits?.map(commit => (
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

export function Authors({ data, loaded }) {
    return (
        <Router>
            <Body data={data} loaded={loaded} />
        </Router>
    );
}

console.log('author 0.02')