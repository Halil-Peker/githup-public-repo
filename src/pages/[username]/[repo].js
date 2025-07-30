import { useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import FileExplorer from '@/components/FileExplorer';
import Link from 'next/link';
import StarIcon from '@/components/icons/star';
import ForkIcon from '@/components/icons/forks';
import DocumentIcon from '@/components/icons/document';
import LeftArrowIcon from '@/components/icons/left';
import GitHubIcon from '@/components/icons/github';

// getServerSideProps fonksiyonu 
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

export default function RepoDetail({ repoData, readmeContent, initialContents }) {
    const [activeTab, setActiveTab] = useState('readme');
    const router = useRouter();
    const { username: queryUsername } = router.query;

    // console.log("RepoData İçeriği: ", repoData)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700">
            <div className=" shadow-xl">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href={queryUsername ? `/?username=${queryUsername}` : '/'}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors w-fit"
                        >
                            <LeftArrowIcon />
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
                                <GitHubIcon />
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 bg-gray-900 mt-5 rounded-md">
                <div className=" rounded-lg shadow-md overflow-hidden border border-gray-600">

                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <StarIcon className='mb-1 mr-1' />
                                <span className="font-medium mr-1">{repoData.stargazers_count}</span> Stars
                            </div>
                            <div className="flex items-center">
                                <ForkIcon fill="black" />
                                <span className="font-medium mr-1">{repoData.forks_count}</span> Forks
                            </div>
                            {repoData.language && (
                                <div className="flex items-center">
                                    <DocumentIcon className="w-2 h-2 mb-1" />
                                    {repoData.language}
                                </div>
                            )}
                        </div>
                    </div>

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

                    <div className="p-6">
                        {activeTab === 'readme' ? (
                            <div className="prose max-w-none">
                                {readmeContent ? (
                                    <ReactMarkdown
                                        components={{
                                            //Bu kısım mardown içeriği css i daha düzgün gelsin diye eklendi. Düz yazı şeklinde geliyordu ve tüm sayfa içeriği eşit şekildeydi.
                                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold my-3" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold my-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-base my-2" {...props} />,
                                        }}
                                    >{readmeContent}</ReactMarkdown>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <DocumentIcon className="w-16 h-16 mx-auto text-gray-300" />
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