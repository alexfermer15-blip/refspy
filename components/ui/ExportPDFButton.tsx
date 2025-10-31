'use client';

import React from 'react';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { KeywordsPDFReport } from '../pdf/KeywordsPDFReport';
// Импортируем типы из PDF компонента, а не из @/types
import type { Keyword, KeywordStats } from '../pdf/KeywordsPDFReport';

interface ExportPDFButtonProps {
  keywords: Keyword[];
  stats: KeywordStats;
  projectName?: string;
  dateRange?: string;
  className?: string;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  keywords,
  stats,
  projectName,
  dateRange,
  className = 'bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200',
}) => {
  const fileName = `refspy_keywords_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <KeywordsPDFReport
          keywords={keywords}
          stats={stats}
          projectName={projectName}
          dateRange={dateRange}
        />
      }
      fileName={fileName}
      className={className}
    >
      {({ blob, url, loading, error }) => (
        <span className="flex items-center gap-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          {loading ? 'Создание PDF...' : 'Экспорт в PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
};
