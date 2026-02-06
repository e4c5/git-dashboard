import React, { useEffect, useState } from 'react';

export function ActivePerWeek({ loaded }) {
    // Calculate weeks from Jan 1, 2024 to today
    const startDate = new Date(2024, 0, 1);
    const today = new Date();
    const weeksFromStart = Math.ceil((today - startDate) / (7 * 24 * 60 * 60 * 1000));

    const [apiData, setApiData] = useState({ by_author: [], aggregate: [], metadata: {} });
    const [selectedProjects, setSelectedProjects] = useState(['BM', 'RMS', 'PHAR']);
    const [activeDays, setActiveDays] = useState(90);
    const [weeksDisplay, setWeeksDisplay] = useState(weeksFromStart);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [viewMode, setViewMode] = useState('per-author'); // 'per-author' or 'aggregate'

    // Fetch available projects on mount
    useEffect(() => {
        fetch('/api/projects/')
            .then(response => response.json())
            .then(json => {
                const projects = json.results ? json.results.map(p => p.name) : json.map(p => p.name);
                setAvailableProjects(projects.sort());
            })
            .catch(err => console.error('Error fetching projects:', err));
    }, []);

    // Fetch chart data when parameters change
    useEffect(() => {
        if (!loaded || selectedProjects.length === 0) return;

        setLoading(true);
        setError(null);

        const projectsQuery = selectedProjects.join(',');
        const url = `/api/commits/active_per_week/?projects=${projectsQuery}&days=${activeDays}&weeks=${weeksDisplay}`;

        console.log(`Fetching: ${url}`);
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(json => {
                        throw new Error(json.error || 'Failed to fetch data');
                    });
                }
                return response.json();
            })
            .then(json => {
                setApiData(json);
                setError(null);
            })
            .catch(err => {
                console.error('Error fetching active_per_week:', err);
                setError(err.message);
                setApiData({ by_author: [], aggregate: [], metadata: {} });
            })
            .finally(() => setLoading(false));
    }, [selectedProjects, activeDays, weeksDisplay, loaded]);

    // Draw per-author chart
    useEffect(() => {
        if (!loaded || viewMode !== 'per-author') return;
        if (!apiData || !apiData.by_author || !Array.isArray(apiData.by_author) || apiData.by_author.length === 0) return;

        try {
            const data = apiData.by_author;
            const weeks = new Map();
            const authors = new Set();

            if (!Array.isArray(data)) {
                console.error('by_author data is not an array:', data);
                setError('Invalid data format received from server');
                return;
            }

            data.forEach(item => {
                if (!weeks.has(item.week)) {
                    weeks.set(item.week, {});
                }
                weeks.get(item.week)[item.author] = item.commits;
                authors.add(item.author);
            });

            const sortedAuthors = Array.from(authors).sort();
            const tableData = [['Week', ...sortedAuthors]];
            Array.from(weeks.keys()).sort().forEach(week => {
                const row = [week];
                const weekData = weeks.get(week);
                sortedAuthors.forEach(author => {
                    row.push(weekData[author] || 0);
                });
                tableData.push(row);
            });

            const dataTable = new google.visualization.arrayToDataTable(tableData);

            const options = {
                title: `Commits per Active Committer per Week (${selectedProjects.join(', ')}) - ${apiData.metadata.active_authors_count} Active Engineers`,
                curveType: 'function',
                legend: { position: 'bottom', maxLines: 5 },
                pointSize: 5,
                hAxis: {
                    title: 'Week',
                    slantedText: true,
                    slantedTextAngle: 45,
                },
                vAxis: {
                    title: 'Number of Commits',
                },
                width: '100%',
                height: 800,
            };

            const chart = new google.visualization.LineChart(
                document.getElementById('active-per-week-chart')
            );
            chart.draw(dataTable, options);
        } catch (err) {
            console.error('Error rendering per-author chart:', err);
            setError(err.message);
        }
    }, [loaded, apiData.by_author, apiData.metadata, selectedProjects, viewMode]);

    // Draw aggregate chart
    useEffect(() => {
        if (!loaded || viewMode !== 'aggregate') return;
        if (!apiData || !apiData.aggregate || !Array.isArray(apiData.aggregate) || apiData.aggregate.length === 0) return;

        try {
            const data = apiData.aggregate;
            const tableData = [['Week', 'Total Commits']];

            if (!Array.isArray(data)) {
                console.error('aggregate data is not an array:', data);
                setError('Invalid data format received from server');
                return;
            }
            
            data.forEach(item => {
                tableData.push([item.week, item.total_commits]);
            });

            const dataTable = new google.visualization.arrayToDataTable(tableData);

            const options = {
                title: `Team Total Commits per Week (${selectedProjects.join(', ')}) - ${apiData.metadata.active_authors_count} Active Engineers`,
                curveType: 'function',
                legend: { position: 'bottom' },
                pointSize: 5,
                hAxis: {
                    title: 'Week',
                    slantedText: true,
                    slantedTextAngle: 45,
                },
                vAxis: {
                    title: 'Total Commits',
                },
                width: '100%',
                height: 800,
                colors: ['#1f77b4'],
            };

            const chart = new google.visualization.LineChart(
                document.getElementById('active-per-week-chart')
            );
            chart.draw(dataTable, options);
        } catch (err) {
            console.error('Error rendering aggregate chart:', err);
            setError(err.message);
        }
    }, [loaded, apiData.aggregate, apiData.metadata, selectedProjects, viewMode]);

    const handleProjectToggle = (project) => {
        setSelectedProjects(prev => {
            if (prev.includes(project)) {
                return prev.filter(p => p !== project);
            } else {
                return [...prev, project].sort();
            }
        });
    };

    const handleSelectAll = () => {
        setSelectedProjects(availableProjects);
    };

    const handleClearAll = () => {
        setSelectedProjects([]);
    };

    if (!loaded) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
        <div style={{ margin: '0', padding: '30px', backgroundColor: '#fff', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ marginTop: '0', marginBottom: '30px' }}>Commits per Active Committer per Week</h2>

            {/* Controls Section */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                {/* View Mode Toggle */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        Display Mode:
                    </label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="viewMode"
                                value="per-author"
                                checked={viewMode === 'per-author'}
                                onChange={(e) => setViewMode(e.target.value)}
                                style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '16px' }}>Per Committer</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="viewMode"
                                value="aggregate"
                                checked={viewMode === 'aggregate'}
                                onChange={(e) => setViewMode(e.target.value)}
                                style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '16px' }}>Team Aggregate</span>
                        </label>
                    </div>
                </div>

                {/* Projects Selector */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        Projects:
                    </label>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {availableProjects.map(project => (
                            <label key={project} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedProjects.includes(project)}
                                    onChange={() => handleProjectToggle(project)}
                                    style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <span style={{ fontSize: '16px' }}>{project}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleSelectAll}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Select All
                        </button>
                        <button 
                            onClick={handleClearAll}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Active Days Slider */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        Active Committer Threshold: <strong>{activeDays} days</strong>
                    </label>
                    <input
                        type="range"
                        min="7"
                        max="365"
                        step="7"
                        value={activeDays}
                        onChange={(e) => setActiveDays(parseInt(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', height: '6px' }}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Only committers with commits in the last {activeDays} days are shown
                    </small>
                </div>

                {/* Weeks Display Selector */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        Display Period:
                    </label>
                    <select
                        value={weeksDisplay}
                        onChange={(e) => setWeeksDisplay(parseInt(e.target.value))}
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        <option value={4}>4 weeks (1 month)</option>
                        <option value={12}>12 weeks (3 months)</option>
                        <option value={24}>24 weeks (6 months)</option>
                        <option value={52}>52 weeks (1 year)</option>
                        <option value={weeksFromStart}>All time (since Jan 1, 2024)</option>
                    </select>
                </div>
            </div>

            {/* Metadata Display */}
            {apiData.metadata && apiData.metadata.active_authors_count > 0 && (
                <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
                    <strong style={{ fontSize: '16px' }}>{apiData.metadata.active_authors_count} active engineer(s)</strong> in the last {activeDays} days:
                    <div style={{ marginTop: '10px', fontSize: '15px', lineHeight: '1.6' }}>
                        {apiData.metadata.active_authors.join(', ')}
                    </div>
                </div>
            )}

            {/* Loading/Error States */}
            {loading && <div style={{ padding: '30px', textAlign: 'center', color: '#666', fontSize: '18px' }}>Loading chart data...</div>}
            {error && <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px', fontSize: '16px' }}>
                <strong>Error:</strong> {error}
            </div>}

            {/* Chart */}
            {!loading && !error && selectedProjects.length > 0 && (
                <div id="active-per-week-chart" style={{ width: '100%', minHeight: '800px' }}></div>
            )}

            {!loading && selectedProjects.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
                    Please select at least one project to display the chart
                </div>
            )}

            {!loading && !error && ((viewMode === 'per-author' && apiData.by_author.length === 0) || (viewMode === 'aggregate' && apiData.aggregate.length === 0)) && selectedProjects.length > 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
                    No commit data found for the selected projects and criteria
                </div>
            )}
        </div>
    );
}

console.log('active-per-week.jsx 0.03')

