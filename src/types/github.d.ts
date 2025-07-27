export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubRepo {
 id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  license?: {
    key: string;
    name: string;
    spdx_id: string | null;
    url: string | null;
  } | null;
  owner: {
    login: string;
  };
}


export interface Repo {
  name: string;
  description?: string; // Now optional instead of null
  stargazers_count: number;
  forks_count: number;
  language?: string;
  owner: {
    login: string;
  };
}

// Then in your page components:
const fetchRepos = async (username: string): Promise<GitHubRepo[]> => {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
        })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        res.status === 404 
          ? 'Kullanıcı bulunamadı' 
          : errorData?.message || `API hatası (${res.status})`
      );
    }

    const data: GitHubRepo[] = await res.json();
    
    return data.map(repo => ({
      ...repo,
      description: repo.description ?? undefined, // null -> undefined
      // Diğer null değerleri de dönüştürebilirsiniz
      language: repo.language ?? undefined,
      license: repo.license?.spdx_id ?? undefined
    }));

  } catch (error) {
    console.error('Repo fetch error:', error);
    throw error; // Hata yönetimi için dış katmana iletiyoruz
  }
};