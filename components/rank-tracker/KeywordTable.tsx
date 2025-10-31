// components/rank-tracker/KeywordTable.tsx
'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, MoreVertical, Trash2, Eye, Power } from 'lucide-react';
import { KeywordWithHistory } from '@/lib/types/rank-tracker';

interface KeywordTableProps {
  keywords: KeywordWithHistory[];
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  onView: (keyword: KeywordWithHistory) => void;
}

export default function KeywordTable({
  keywords,
  onDelete,
  onToggle,
  onView,
}: KeywordTableProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const getPositionBadge = (position: number | null) => {
    if (!position) {
      return <span className="text-gray-500">Не найдено</span>;
    }

    let color = 'gray';
    if (position <= 3) color = 'green';
    else if (position <= 10) color = 'orange';
    else if (position <= 30) color = 'yellow';

    return (
      <span className={`text-${color}-500 font-bold`}>
        #{position}
      </span>
    );
  };

  const getChangeIcon = (change: number | null) => {
    if (!change || change === 0) {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ключевое слово
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Позиция
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Изменение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Поисковик
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Нет ключевых слов. Добавьте первое!
                </td>
              </tr>
            ) : (
              keywords.map((keyword) => (
                <tr key={keyword.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{keyword.keyword}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {keyword.target_url}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPositionBadge(keyword.latest_position?.position || null)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(keyword.latest_position?.position_change || null)}
                      {keyword.latest_position?.position_change && (
                        <span className={`text-sm ${
                          keyword.latest_position.position_change > 0
                            ? 'text-green-500'
                            : keyword.latest_position.position_change < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          {Math.abs(keyword.latest_position.position_change)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 capitalize">
                      {keyword.search_engine}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggle(keyword.id, !keyword.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        keyword.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {keyword.is_active ? 'Активно' : 'Отключено'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setMenuOpen(menuOpen === keyword.id ? null : keyword.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {menuOpen === keyword.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                          <button
                            onClick={() => {
                              onView(keyword);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Просмотр
                          </button>
                          <button
                            onClick={() => {
                              onToggle(keyword.id, !keyword.is_active);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Power className="w-4 h-4" />
                            {keyword.is_active ? 'Отключить' : 'Включить'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Удалить ключевое слово?')) {
                                onDelete(keyword.id);
                              }
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
