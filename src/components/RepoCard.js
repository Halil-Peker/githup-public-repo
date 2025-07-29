import Link from 'next/link';
import StarIcon from './icons/star';
import ForkIcon from './icons/forks';

export default function RepoCard({ repo }) {
    return (
        <Link className="border rounded-lg p-4 hover:shadow-xl transition-shadow bg-[#202830] text-white  hover:rounded-none transition-hover   hover:bg-[#151B23] hover:z-50" href={`/${repo.owner.login}/${repo.name}`} passHref>
            <div className="cursor-pointer">
                <h3 className="text-xl font-bold">{repo.name}</h3>
                <p className="text-gray-200 my-2">{repo.description || 'Açıklama yok'}</p>
                <div className="flex space-x-4 text-sm">
                    <span className="flex items-center gap-1">
                        <StarIcon className="w-5 h-5" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <ForkIcon className="w-5 h-5 mt-2" /> {repo.forks_count}
                    </span>
                </div>
            </div>
        </Link>
    );
}