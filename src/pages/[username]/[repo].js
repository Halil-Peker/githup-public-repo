import { useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import FileExplorer from '@/components/FileExplorer';
import Link from 'next/link';

// getServerSideProps fonksiyonu sayfa bileşeninden önce gelmelidir
export async function getServerSideProps(context) {
    const { username, repo } = context.params;
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
            repoRes.json(),
            contentsRes.json()
        ]);

        let readmeContent = '';
        try {
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
                const readmeApiRes = await fetch(
                    `https://api.github.com/repos/${username}/${repo}/readme`,
                    headers
                );

                if (readmeApiRes.ok) {
                    const readmeData = await readmeApiRes.json();
                    readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
                }
            }
        } catch (error) {
            console.error('README okuma hatası:', error);
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
// Sayfa bileşeni getServerSideProps'tan sonra gelir
export default function RepoDetail({ repoData, readmeContent, initialContents }) {
    const [activeTab, setActiveTab] = useState('readme');
    const router = useRouter();
    const { username: queryUsername } = router.query;

    // console.log("RepoData İçeriği: ", repoData)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700">
            {/* Header Section */}
            <div className=" shadow-xl">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href={queryUsername ? `/?username=${queryUsername}` : '/'}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors w-fit"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kullanıcı Sayfasına Dön
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold ">{repoData.name}</h1>
                                <p className="text-gray-300 mt-1">{repoData.description}</p>
                            </div>

                            <a
                                href={repoData.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 bg-gray-900 mt-5 rounded-md">
                <div className=" rounded-lg shadow-md overflow-hidden border border-gray-600">
                    {/* Stats Bar */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{repoData.stargazers_count}</span> Stars
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{repoData.forks_count}</span> Forks
                            </div>
                            {repoData.language && (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                    {repoData.language}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('readme')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'readme' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-200 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                README.md
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'files' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-200 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Repository Files
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'readme' ? (
                            <div className="prose max-w-none">
                                {readmeContent ? (
                                    <ReactMarkdown>{readmeContent}</ReactMarkdown>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-4 text-lg">No README found</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <FileExplorer
                                username={repoData.owner.login}
                                repoName={repoData.name}
                                initialContents={initialContents}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}