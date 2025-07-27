import { useState, useEffect } from 'react';
import { GitHubFile } from '@/types/github';

interface FileContentProps {
  file: GitHubFile;
  onBack: () => void;
}

export default function FileContent({ file, onBack }: FileContentProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!file.download_url) {
        setContent('Dosya içeriği görüntülenemiyor');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(file.download_url);
        setContent(await res.text());
      } catch (error) {
        setContent('Dosya yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (file.type === 'file') fetchContent();
  }, [file]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 px-3 py-1 bg-gray-200 rounded">
        ← Geri
      </button>
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">{file.name}</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : (
          <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}