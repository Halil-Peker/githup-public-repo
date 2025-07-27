import { useState } from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import FileExplorer from '@/components/FileExplorer';
import { GitHubFile, GitHubRepo } from '@/types/github';
import Link from 'next/link';

interface RepoDetailProps {
  repoData: GitHubRepo;
  readmeContent: string;
  initialContents: GitHubFile[];
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<RepoDetailProps>> {
  const { username, repo } = context.params as { username: string; repo: string };
  const headers = {
    headers: {
      Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  };

  try {
    const [repoRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${username}/${repo}`, headers),
      fetch(`https://api.github.com/repos/${username}/${repo}/contents`, headers)
    ]);

    if (!repoRes.ok) throw new Error('Repo bulunamadı');

    const [repoData, contentsData] = await Promise.all([
      repoRes.json() as Promise<GitHubRepo>,
      contentsRes.json() as Promise<GitHubFile[] | GitHubFile>
    ]);

    let readmeContent = '';
    try {
      // Önce direkt raw README içeriğini almaya çalış
      const readmeRawRes = await fetch(
        `https://api.github.com/repos/${username}/${repo}/readme`,
        { 
          headers: { 
            'Accept': 'application/vnd.github.v3.raw',
            'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          } 
        }
      );

      if (readmeRawRes.ok) {
        readmeContent = await readmeRawRes.text();
      } else {
        // Raw başarısız olursa normal API isteği yap
        const readmeApiRes = await fetch(
          `https://api.github.com/repos/${username}/${repo}/readme`,
          headers
        );
        
        if (readmeApiRes.ok) {
          const readmeData = await readmeApiRes.json();
          // Base64 decode işlemi
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        }
      }
    } catch (error) {
      console.error('README okuma hatası:', error);
      // README bulunamazsa içeriklerde arama yap
      const contents = Array.isArray(contentsData) ? contentsData : [contentsData];
      const readmeFile = contents.find(file => 
        file.name.toLowerCase().startsWith('readme') && 
        file.type === 'file'
      );
      
      if (readmeFile?.download_url) {
        const readmeRes = await fetch(readmeFile.download_url, headers);
        readmeContent = await readmeRes.text();
      }
    }

    return {
      props: { 
        repoData,
        readmeContent,
        initialContents: Array.isArray(contentsData) ? contentsData : [contentsData]
      },
    };
  } catch (error) {
    console.error('Hata:', error);
    return { notFound: true };
  }
}

export default function RepoDetail({ repoData, readmeContent, initialContents }: RepoDetailProps) {
  const [activeTab, setActiveTab] = useState<'readme' | 'files'>('readme');
  const router = useRouter();
  const { username: queryUsername } = router.query;

  return (
    <div className="container mx-auto p-4">
      {/* Geri Dön Butonu */}
      <div className="mb-4">
        <Link
          href={queryUsername ? `/?username=${queryUsername}` : '/'}
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </Link>
      </div>

      {/* Repo Başlık Bilgileri */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{repoData.name}</h1>
        <p className="text-gray-600">{repoData.description}</p>
        <div className="flex space-x-4 mt-2 text-sm">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            {repoData.stargazers_count}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {repoData.forks_count}
          </span>
          {repoData.language && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              {repoData.language}
            </span>
          )}
        </div>
      </div>

      {/* Tablar */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'readme' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('readme')}
        >
          README
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'files' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('files')}
        >
          Dosyalar
        </button>
      </div>

      {/* İçerik Alanı */}
      {activeTab === 'readme' && (
        <div className="prose max-w-none">
          {readmeContent ? (
            <ReactMarkdown>{readmeContent}</ReactMarkdown>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Bu repo için README dosyası bulunamadı.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <FileExplorer
          username={repoData.owner.login}
          repoName={repoData.name}
          initialContents={initialContents}
        />
      )}
    </div>
  );
}