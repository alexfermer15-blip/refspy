'use client';

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet
} from '@react-pdf/renderer';

// Не регистрируем шрифты - используем встроенные с поддержкой Unicode
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
  },
  
  // Заголовок документа
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
    borderBottomStyle: 'solid',
  },
  
  logoContainer: {
    flexDirection: 'column',
  },
  
  logo: {
    fontSize: 24,
    marginBottom: 5,
  },
  
  logoRef: {
    color: '#FF4500',
  },
  
  logoSpy: {
    color: '#000000',
  },
  
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  
  headerInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#666666',
  },
  
  headerInfoText: {
    marginBottom: 3,
  },
  
  // Статистические карточки
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  
  statCard: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  
  statCardOrange: {
    backgroundColor: '#FF4500',
  },
  
  statNumber: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Таблица
  tableContainer: {
    marginTop: 20,
  },
  
  tableTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1F2937',
  },
  
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    minHeight: 35,
  },
  
  tableHeaderRow: {
    flexDirection: 'row',
    minHeight: 35,
  },
  
  tableHeader: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    fontSize: 9,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderRightStyle: 'solid',
  },
  
  tableCell: {
    fontSize: 9,
    padding: 8,
    justifyContent: 'center',
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderRightStyle: 'solid',
  },
  
  // Колонки таблицы
  colKeyword: {
    width: '25%',
  },
  
  colUrl: {
    width: '25%',
  },
  
  colPosition: {
    width: '12%',
    alignItems: 'center',
  },
  
  colChange: {
    width: '12%',
    alignItems: 'center',
  },
  
  colEngine: {
    width: '13%',
    alignItems: 'center',
  },
  
  colStatus: {
    width: '13%',
    alignItems: 'center',
    borderRightWidth: 0,
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
  },
  
  statusActive: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
  },
  
  statusInactive: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
  },
  
  changePositive: {
    color: '#10B981',
  },
  
  changeNegative: {
    color: '#EF4444',
  },
  
  changeNeutral: {
    color: '#6B7280',
  },
  
  urlText: {
    fontSize: 8,
    color: '#6B7280',
  },
  
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  },
});

export interface Keyword {
  id: string;
  keyword: string;
  url: string;
  position: number;
  change: number;
  search_engine: 'google' | 'yandex' | 'bing';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface KeywordStats {
  total: number;
  active: number;
  in_top_3: number;
  improved: number;
  declined: number;
}

interface KeywordsPDFReportProps {
  keywords: Keyword[];
  stats: KeywordStats;
  projectName?: string;
  dateRange?: string;
}

export const KeywordsPDFReport: React.FC<KeywordsPDFReportProps> = ({
  keywords,
  stats,
  projectName = 'RefSpy Project',
  dateRange,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatChange = (change: number): string => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return '0';
  };

  const getChangeStyle = (change: number) => {
    if (change > 0) return styles.changePositive;
    if (change < 0) return styles.changeNegative;
    return styles.changeNeutral;
  };

  const getStatusText = (status: string): string => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getStatusStyle = (status: string) => {
    return status === 'active' ? styles.statusActive : styles.statusInactive;
  };

  const getSearchEngineName = (engine: string): string => {
    if (engine === 'google') return 'Google';
    if (engine === 'yandex') return 'Yandex';
    if (engine === 'bing') return 'Bing';
    return engine;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>
              <Text style={styles.logoRef}>Ref</Text>
              <Text style={styles.logoSpy}>Spy</Text>
            </Text>
            <Text style={styles.subtitle}>
              Rank Tracking Report
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerInfoText}>{projectName}</Text>
            <Text style={styles.headerInfoText}>{currentDate}</Text>
            {dateRange && <Text style={styles.headerInfoText}>Period: {dateRange}</Text>}
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Keywords</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.in_top_3}</Text>
            <Text style={styles.statLabel}>In Top 3</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.improved}</Text>
            <Text style={styles.statLabel}>Improved</Text>
          </View>
        </View>

        {/* Keywords Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Keywords</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableHeader, styles.colKeyword]}>
                <Text>Keyword</Text>
              </View>
              <View style={[styles.tableHeader, styles.colUrl]}>
                <Text>URL</Text>
              </View>
              <View style={[styles.tableHeader, styles.colPosition]}>
                <Text>Position</Text>
              </View>
              <View style={[styles.tableHeader, styles.colChange]}>
                <Text>Change</Text>
              </View>
              <View style={[styles.tableHeader, styles.colEngine]}>
                <Text>Search Engine</Text>
              </View>
              <View style={[styles.tableHeader, styles.colStatus]}>
                <Text>Status</Text>
              </View>
            </View>
            
            {/* Table Rows */}
            {keywords.map((keyword, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCell, styles.colKeyword]}>
                  <Text style={styles.textLeft}>{keyword.keyword}</Text>
                </View>
                
                <View style={[styles.tableCell, styles.colUrl]}>
                  <Text style={[styles.textLeft, styles.urlText]}>
                    {keyword.url.length > 35 
                      ? `${keyword.url.substring(0, 35)}...` 
                      : keyword.url
                    }
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.colPosition]}>
                  <Text style={styles.textCenter}>
                    {keyword.position > 100 ? '100+' : keyword.position}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.colChange]}>
                  <Text style={[styles.textCenter, getChangeStyle(keyword.change)]}>
                    {formatChange(keyword.change)}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.colEngine]}>
                  <Text style={styles.textCenter}>
                    {getSearchEngineName(keyword.search_engine)}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, styles.colStatus]}>
                  <View style={[styles.statusBadge, getStatusStyle(keyword.status)]}>
                    <Text>{getStatusText(keyword.status)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by RefSpy — refspy.app | Page 1 | {currentDate}
        </Text>
      </Page>
    </Document>
  );
};
