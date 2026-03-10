/**
 * SFA02 - CSV出力ユーティリティ
 */

const CsvUtils = {
  /**
   * CSVダウンロード
   * @param {string} filename - ファイル名（拡張子なし）
   * @param {string[]} headers - ヘッダー行
   * @param {Array[]} rows - データ行の配列
   */
  download(filename, headers, rows) {
    const escape = (val) => {
      const str = String(val == null ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(row => row.map(escape).join(',')),
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  },
};
