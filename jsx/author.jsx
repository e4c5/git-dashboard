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


/**
 * Renders a table displaying the author and their number of commits.
 * @param {Object} props - The component props.
 * @param {Array} props.data - The data containing author information and commit counts.
 * @returns {JSX.Element} - The rendered table component.
 */
export function AuthorCommitsTable({ data, loaded }) {
    const chartRef = useRef(null);
    useEffect(() => {
        if (loaded && window?.google?.charts && data) {
            drawAuthorCommits(data);
        }
    },[data, loaded]);


    function drawAuthorCommits(data) {
        console.log('Draw the chart')
        const dataGoogle = new window.google.visualization.DataTable();
        dataGoogle.addColumn('string', 'Author');
        dataGoogle.addColumn('number', 'Commits');
        dataGoogle.addRows(data.map((item) => [item.name, item.total]));

        const chart = new window.google.visualization.PieChart(chartRef.current);
        chart.draw(dataGoogle, options);

    }

    return (
        <>
            <div className='row mt-1'>
                <h2>Activity by contributor</h2>
            </div>
            <div className='row mt-5'>
                <div id="author_table_div" className='col-6'>
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
                                    <td>{item.total}</td>
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

    useEffect(() => {
        if(id) {
            fetch(`/api/authors/${id}?detail=true`)
                .then(response => response.json())
                .then(data => setCommits(data));
        }
    }, [id]);

    if (commits) {
        return (
            <div>
                <h3>Activity for {commits.name}</h3>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Hash</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commits.commits.map(commit => (
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

export function AuthorCommitsPage({ data, loaded }) {
    return (
        <Router>
            <Routes>
                <Route path="/" element = {AuthorCommitsTable({data, loaded}) } />
                <Route path="/:id" element={<AuthorCommits/>} />
            </Routes>
        </Router>
    );
}

console.log('author 0.02')