import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link , useParams} from 'react-router-dom';


export function AuthorCommitsTable({ data, onAuthorClick }) {
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
                            <Link to={`/${item.name}`}>
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


function AuthorCommits({ match }) {
    const { name } = useParams();

    // Fetch and display the commits by the author.
    // This is just a placeholder. Replace it with your actual implementation.
    return <div>Commits by {name}</div>;
}

export function AuthorCommitsPage({ data }) {
    return (
        <Router>
            <Routes>
                <Route path="/" element = {AuthorCommitsTable({data}) } />
                <Route path="/:name" element={<AuthorCommits/>} />
            </Routes>
        </Router>
    );
}

console.log('author 0.01')