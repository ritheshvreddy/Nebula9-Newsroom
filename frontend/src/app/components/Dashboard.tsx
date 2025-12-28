"use client";
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  status: string;
  created_at: string;
  angle: string;
}

export default function Dashboard({ articles, onCreateNew, onEdit }: any) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Recent Stories</h2>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + New Story
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Title / Topic</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Angle</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Last Updated</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((article: Article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{article.title || "Untitled Draft"}</td>
                <td className="p-4 text-gray-500 text-sm truncate max-w-xs">{article.angle || "-"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {article.created_at ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true }) : '-'}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onEdit(article)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No stories yet. Click "New Story" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}