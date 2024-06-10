import React, { useEffect, useState } from 'react';
import { AuthorCommitsPage } from './author.jsx';
import { Projects } from './project.jsx';
import { Repositories } from './repo.jsx';

export function Chart() {
    const [data, setData] = useState({author_commits: [], repo_commits: [], project_commits: []});
    const [loaded, setLoaded] = useState(false);

    /**
     * This effect will fetch three different sets of data from the API and update the
     * 'data' state with the results.
     */
    useEffect(() => {
        fetch('/api/commits/by_author/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState, author_commits: json})));

        fetch('/api/commits/by_repository/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState,  repo_commits: json})));

        fetch('/api/commits/by_project/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState, project_commits: json})));

    }, []);

    /**
     * When a data fetch has completed this effect will flag the chart library is loaded
     */
    useEffect(() => {
        if (window?.google?.charts) {
            window.google.charts.setOnLoadCallback(() => setLoaded(true));
        }

    }, [data]);

    return (
        <>
            <AuthorCommitsPage data={data.author_commits} loaded={loaded} />
            <Projects data={data.project_commits} loaded={loaded} />
            <Repositories data={data.repo_commits} loaded={loaded} />
        </>)
}


console.log('charts.js 0.01')