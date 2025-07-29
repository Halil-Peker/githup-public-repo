import { useState } from 'react';
import FileContent from './FileContent';

export default function FileExplorer({ username, repoName, initialContents }) {
  const [contents, setContents] = useState(initialContents);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState(['root']);

  const fetchContents = async (path) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      const data = await res.json();
      setContents(Array.isArray(data) ? data : [data]);
      setSelectedFile(null);
      setCurrentPath(path);
      
      // Breadcrumb güncelleme
      const paths = path.split('/');
      setBreadcrumbs(['root', ...paths]);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (index) => {
    if (index === 0) {
      setContents(initialContents);
      setCurrentPath('');
      setBreadcrumbs(['root']);
    } else {
      const path = breadcrumbs.slice(1, index + 1).join('/');
      fetchContents(path);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center text-sm text-gray-300">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 mx-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => navigateToPath(index)}
                className={`hover:text-white ${index === breadcrumbs.length - 1 ? 'text-blue-400 font-medium' : ''}`}
              >
                {crumb === 'root' ? repoName : crumb}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-4">
        {selectedFile ? (
          <FileContent 
            file={selectedFile} 
            onBack={() => setSelectedFile(null)}
            className="bg-gray-800 rounded-lg p-4"
          />
        ) : (
          <div className="space-y-2">
            {contents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Bu dizin boş görünüyor</p>
              </div>
            )}

            {contents.map((item) => (
              <div
                key={item.path}
                className="flex items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer group"
                onClick={() => item.type === 'dir' 
                  ? fetchContents(item.path) 
                  : setSelectedFile(item)
                }
              >
                <div className={`p-2 rounded-lg mr-3 ${item.type === 'dir' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  {item.type === 'dir' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="text-gray-200 group-hover:text-white transition-colors">{item.name}</div>
                  {item.type === 'file' && (
                    <div className="text-xs text-gray-500">{Math.round(item.size / 1024)} KB</div>
                  )}
                </div>
                
                <svg className="w-5 h-5 ml-3 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}