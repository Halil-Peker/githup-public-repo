import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RepoCard from '@/components/RepoCard';
import { GitHubRepo } from '@/types/github';

export default function Home() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRepos = async (username: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || loading) return;
    
    // Shallow routing KULLANMIYORUZ
    await router.push(`/?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-6 w-full ">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub kullanıcı adı"
          className="px-4 py-2 border rounded col-span-10 bg-[#202830] text-white"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded col-span-2 cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Yükleniyor...' : 'Ara'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error!</p>
          <p>{error}</p>
          {error.includes('API rate limit') && (
            <p className="mt-2 text-sm">
              GitHub API rate limit exceeded. Please wait or add a personal access token.
            </p>
          )}
        </div>
      )}

      {!loading && repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <RepoCard key={repo.id || repo.name} repo={repo} />
          ))}
        </div>
      ) : !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">👋 Hello!</p>
          <p>Enter a GitHub username to view their public repositories.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}