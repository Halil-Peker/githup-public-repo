import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import LeftArrowIcon from './icons/left';

export default function FileContent({ file, onBack }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      if (!file.download_url && !file.content) {
        setContent('Dosya içeriği görüntülenemiyor');
        return;
      }

      try {
        setLoading(true);
        setError('');

        if (file.content) {
          try {
            const decodedContent = atob(file.content); // base64 decode işlemini burada yapıyorumm
            setContent(decodedContent);
          } catch (e) {
            setError('Dosya çözümlenemedi (base64 hatası)');
            console.error('Base64 decode hatası:', e);
          }
          return;
        }

        // console.log("file içeriği::::::", file)

        const res = await fetch(file.download_url);
        if (!res.ok) throw new Error('Dosya alınamadı');
        setContent(await res.text());
      } catch (error) {
        setError('Dosya yüklenirken hata oluştu');
        console.error('Fetch hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    if (file.type === 'file') fetchContent();
  }, [file]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 px-3 py-1 bg-[#202830] rounded flex">
        <LeftArrowIcon /> Geri
      </button>
      <div className="bg-[#202830] p-4 rounded">
        <h3 className="font-bold mb-2">{file.name}</h3>

        {loading ? (
          <div>Yükleniyoooor...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : file.name.split('.').pop().toLowerCase() === 'md' ? (
          <ReactMarkdown
            components={{
              //Bu kısım mardown içeriği css i daha düzgün gelsin diye eklendi. Düz yazı şeklinde geliyordu ve tüm sayfa içeriği eşit şekildeydi.
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold my-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-semibold my-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-base my-2" {...props} />
            }}
          >{content}</ReactMarkdown>
        ) : (
          <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}