import { useState } from 'react';
import FileContent from './FileContent';
import { GitHubFile } from '@/types/github';

interface FileExplorerProps {
  username: string;
  repoName: string;
  initialContents: GitHubFile[];
}

export default function FileExplorer({ username, repoName, initialContents }: FileExplorerProps) {
  const [contents, setContents] = useState<GitHubFile[]>(initialContents);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);

  const fetchContents = async (path: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${path}`
      );
      const data: GitHubFile[] | GitHubFile = await res.json();
      setContents(Array.isArray(data) ? data : [data]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {selectedFile ? (
        <FileContent file={selectedFile} onBack={() => setSelectedFile(null)} />
      ) : (
        <div>
          {loading && <p>Yükleniyor...</p>}
          <ul className="">
            {contents.map((item) => (
              <li 
                key={item.path}
                className="flex items-center my-2 p-4 bg-[#202830] text-white hover:text-gray-200 rounded-sm hover:bg-gray-600  cursor-pointer"
                onClick={() => item.type === 'dir' 
                  ? fetchContents(item.path) 
                  : setSelectedFile(item)
                }
              >
                {item.type === 'dir' ? '📁' : '📄'} {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}