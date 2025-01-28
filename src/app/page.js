"use client"
import { useState } from 'react';

export default function Home() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      // Build query string
      const fn = firstName.trim();
      const ln = lastName.trim();
      if (!fn || !ln) {
        throw new Error('Please enter both first and last name.');
      }

      const query = `firstName=${encodeURIComponent(fn)}&lastName=${encodeURIComponent(ln)}`;

      // Call our API route
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Teacher Credential Lookup (First &amp; Last Name Only)</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="firstName">First Name: </label>
          <input
            id="firstName"
            type="text"
            placeholder="e.g. Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="lastName">Last Name: </label>
          <input
            id="lastName"
            type="text"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
