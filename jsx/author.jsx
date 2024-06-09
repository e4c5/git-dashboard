import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams} from 'react-router-dom';


export function AuthorCommitsTable({ data }) {
    return (
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

export function AuthorCommitsPage({ data }) {
    return (
        <Router>
            <Routes>
                <Route path="/" element = {AuthorCommitsTable({data}) } />
                <Route path="/:id" element={<AuthorCommits/>} />
            </Routes>
        </Router>
    );
}

console.log('author 0.01')