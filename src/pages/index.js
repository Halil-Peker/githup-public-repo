import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RepoCard from '@/components/RepoCard';
import SpinLoader from '@/components/icons/loader';

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const fetchRepos = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          })
        }
      });

      if (!res.ok) throw new Error('Kullanıcı bulunamadı');
      const data = await res.json();
      setRepos(data);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const { username: queryUsername } = router.query;
    if (queryUsername && typeof queryUsername === 'string') {
      setUsername(queryUsername);
      fetchRepos(queryUsername);
    }
  }, [router.isReady, router.query.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || loading) return;
    
    await router.push(`/?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-600 ${hasSearched ? 'py-4' : 'flex items-center justify-center'}`}>
      <div className={`container mx-auto px-4 transition-all duration-300 ${hasSearched ? 'max-w-7xl' : 'max-w-md'}`}>
        {/* Search Section */}
        <div className={`bg-gray-800 rounded-xl p-6 shadow-2xl ${hasSearched ? 'mb-8' : ''}`}>
          <h1 className="text-3xl font-bold text-center text-white mb-6">GitHub Repo Finder</h1>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub kullanıcı adı girin"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  {/* <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg> */}
                  <SpinLoader />
                  Aranıyor...
                </div>
              ) : 'Ara'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="transition-all duration-300">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded-r-lg">
              <p className="font-bold">Hata!</p>
              <p>{error}</p>
              {error.includes('API rate limit') && (
                <p className="mt-2 text-sm">
                  GitHub API limiti aşıldı. Lütfen bekleyin veya kişisel erişim token ekleyin.
                </p>
              )}
            </div>
          )}

          {!loading && repos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo) => (
                <RepoCard key={repo.id || repo.name} repo={repo} />
              ))}
            </div>
          ) : !loading && !error && !hasSearched ? (
            <div className="text-center py-12 text-gray-400">
              <div className="inline-block bg-gray-800 p-8 rounded-xl">
                <p className="text-2xl mb-4">👋 Merhaba!</p>
                <p className="text-lg">Bir GitHub kullanıcı adı girerek<br />public repolarını görüntüleyebilirsiniz.</p>
              </div>
            </div>
          ) : !loading && !error && hasSearched ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">Repolar bulunamadı</p>
              <p>Bu kullanıcının herhangi bir public reposu yok.</p>
            </div>
          ) : null}

          {loading && repos.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}