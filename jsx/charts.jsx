import React, { useEffect, useState } from 'react';
import { Authors } from './author.jsx';
import { Projects } from './project.jsx';
import { Repositories } from './repo.jsx';
import { ActivePerWeek } from './active-per-week.jsx';

export function Chart() {
    const [data, setData] = useState({author_commits: [], repo_commits: [], project_commits: [], active_per_week: []});
    const [loaded, setLoaded] = useState(false);
    const [config, setConfig] = useState({});

    /**
     * This effect will fetch four different sets of data from the API and update the
     * 'data' state with the results.
     */
    useEffect(() => {
        fetch('/api/config/')
            .then(response => response.json())
            .then(json => setConfig(json));

        fetch('/api/commits/by_author/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState, author_commits: json})));

        fetch('/api/commits/by_repository/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState,  repo_commits: json})));

        fetch('/api/commits/by_project/')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState, project_commits: json})));

        // Fetch active committers per week for specific projects
        fetch('/api/commits/active_per_week/?projects=BM,RMS,PHAR&days=90&weeks=24')
            .then(response => response.json())
            .then(json => setData(prevState => ({...prevState, active_per_week: json})))
            .catch(error => console.error('Error fetching active_per_week:', error));

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
            <ActivePerWeek data={data.active_per_week} loaded={loaded} />
            <Authors data={data.author_commits} loaded={loaded} config={config}/>
            <Projects data={data.project_commits} loaded={loaded} />
            <Repositories data={data.repo_commits} loaded={loaded} config={config} />
        </>)
}


console.log('charts.js 0.01')