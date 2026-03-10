/**
 * SFA02 - フィルター共通ユーティリティ
 */

const FilterUtils = {
  /**
   * 配列をフィルタリング
   */
  applyFilters(items, filters) {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '' || value === 'all') return true;

        if (key === 'dateRange') {
          return this.matchDateRange(item, value);
        }
        if (key === 'overdue') {
          return value === 'true' ? this.isOverdue(item.due_date) : true;
        }

        return String(item[key]) === String(value);
      });
    });
  },

  /**
   * 期限超過チェック
   */
  isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
  },

  /**
   * 日付範囲マッチ
   */
  matchDateRange(item, range) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateField = item.due_date || item.meeting_date || item.acquired_date;
    if (!dateField) return true;
    const d = new Date(dateField);

    switch (range) {
      case 'today': {
        const end = new Date(today);
        end.setDate(end.getDate() + 1);
        return d >= today && d < end;
      }
      case 'thisWeek': {
        const end = new Date(today);
        end.setDate(end.getDate() + (7 - today.getDay()));
        return d >= today && d < end;
      }
      case 'nextWeek': {
        const start = new Date(today);
        start.setDate(start.getDate() + (7 - today.getDay()));
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return d >= start && d < end;
      }
      case 'overdue':
        return d < today;
      case 'thisMonth': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return d >= start && d < end;
      }
      case 'lastMonth': {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 1);
        return d >= start && d < end;
      }
      case 'quarter': {
        const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return d >= start && d <= today;
      }
      default:
        return true;
    }
  },

  /**
   * 日付フォーマット
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  },

  /**
   * 金額フォーマット
   */
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '-';
    return '¥' + Number(amount).toLocaleString();
  },

  /**
   * フィルター保存（localStorage）
   */
  saveFilter(screenKey, name, filters) {
    const storageKey = 'sfa02_filters_' + screenKey;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    saved.push({ name, filters: JSON.parse(JSON.stringify(filters)) });
    localStorage.setItem(storageKey, JSON.stringify(saved));
    return saved;
  },

  getSavedFilters(screenKey) {
    const storageKey = 'sfa02_filters_' + screenKey;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  },

  deleteSavedFilter(screenKey, index) {
    const storageKey = 'sfa02_filters_' + screenKey;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    saved.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(saved));
    return saved;
  },

  /**
   * カラム表示切替（localStorage）
   */
  saveColumnVisibility(screenKey, visibleColumns) {
    const storageKey = 'sfa02_columns_' + screenKey;
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  },

  getColumnVisibility(screenKey, defaultColumns) {
    const storageKey = 'sfa02_columns_' + screenKey;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [...defaultColumns];
  },
};
