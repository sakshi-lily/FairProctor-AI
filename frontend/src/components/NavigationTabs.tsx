import React from 'react';
import {
  BarChart3,
  ListOrdered,
  FileSearch,
  Scale,
  CheckSquare,
} from 'lucide-react';

export type PageId = 'overview' | 'queue' | 'detail' | 'fairness' | 'decisions';

interface Props {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  queueCount?: number;
  environmentalNoticeCount?: number;
}

export const NavigationTabs: React.FC<Props> = ({
  activePage,
  onSelectPage,
  queueCount,
  environmentalNoticeCount,
}) => {
  const tabs = [
    {
      id: 'overview' as PageId,
      name: 'Overview',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'queue' as PageId,
      name: 'Review Queue',
      icon: ListOrdered,
      badge: queueCount !== undefined ? queueCount : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'detail' as PageId,
      name: 'Session Details',
      icon: FileSearch,
      badge: null,
    },
    {
      id: 'fairness' as PageId,
      name: 'Fairness Audit',
      icon: Scale,
      badge: environmentalNoticeCount !== undefined && environmentalNoticeCount > 0 ? environmentalNoticeCount : null,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'decisions' as PageId,
      name: 'Decisions Log',
      icon: CheckSquare,
      badge: null,
    },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2 sm:py-0 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPage(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all rounded-t-lg ${
                  isActive
                    ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      tab.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
