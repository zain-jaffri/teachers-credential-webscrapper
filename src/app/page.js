"use client"
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [credential, setCredential] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent form from reloading the page
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      // Build query string
      let query = '';
      if (name.trim()) {
        query += `name=${encodeURIComponent(name.trim())}`;
      }
      if (credential.trim()) {
        // If name is already in the query, add '&'
        if (query) query += '&';
        query += `credential=${encodeURIComponent(credential.trim())}`;
      }

      if (!query) {
        setLoading(false);
        setError('Please enter a name or credential number.');
        return;
      }

      // Send request to our API route
      const response = await fetch(`/api/scrape?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <h1>Teacher Credential Lookup</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="name">Teacher Name (Optional): </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="credential">Credential Number (Optional): </label>
          <input
            id="credential"
            type="text"
            placeholder="e.g. 123456"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Search
        </button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          <h2>Search Results:</h2>
          <p>
            {typeof results === 'string'
              ? results
              : JSON.stringify(results, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
}
