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
      description: 'System health & aggregate statistics',
    },
    {
      id: 'queue' as PageId,
      name: 'Session Review Queue',
      icon: ListOrdered,
      badge: queueCount !== undefined ? queueCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      description: 'Prioritized examination sessions',
    },
    {
      id: 'detail' as PageId,
      name: 'Session Details',
      icon: FileSearch,
      badge: null,
      description: 'Granular multi-modal inspection',
    },
    {
      id: 'fairness' as PageId,
      name: 'Environmental Fairness',
      icon: Scale,
      badge: environmentalNoticeCount !== undefined && environmentalNoticeCount > 0 ? environmentalNoticeCount : null,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      description: 'Shared space & connectivity non-penalization',
    },
    {
      id: 'decisions' as PageId,
      name: 'Reviewer Decisions',
      icon: CheckSquare,
      badge: null,
      description: 'Human adjudication audit log',
    },
  ];

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 sticky top-16 z-30">
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
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                      tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
