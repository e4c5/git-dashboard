import React, { useState } from 'react';

export function AuthorCommitsTable({ data, onAuthorClick }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Author</th>
                    <th>Commits</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.name}>
                        <td>
                            <a href="#" onClick={(e) => { e.preventDefault(); onAuthorClick(item.name); }}>
                                {item.name}
                            </a>
                        </td>
                        <td>{item.total}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}



export function AuthorCommitsPage({ data }) {
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    function handleAuthorClick(name) {
        console.log(`Fetching commits by ${name}...`);
        setSelectedAuthor(name);
    }

    if (selectedAuthor) {
        // If an author is selected, display the commits by the author.
        // This is just a placeholder. Replace it with your actual implementation.
        return <div>Commits by {selectedAuthor}</div>;
    } else {
        // If no author is selected, display the list of authors.
        return <AuthorCommitsTable data={data} onAuthorClick={handleAuthorClick} />;
    }
}