/**
 * SFA02 - スプレッドシート汎用CRUD操作
 */

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  return sheet;
}

/**
 * シートの全データを取得（1行目=ヘッダー）
 */
function getAllRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

/**
 * IDで1行取得
 */
function getRowById(sheetName, id) {
  const rows = getAllRows(sheetName);
  return rows.find(r => r.id === id) || null;
}

/**
 * フィルター条件に一致する行を取得
 */
function getRowsWhere(sheetName, filters) {
  const rows = getAllRows(sheetName);
  return rows.filter(row => {
    return Object.keys(filters).every(key => {
      if (filters[key] === null || filters[key] === undefined || filters[key] === '') return true;
      return String(row[key]) === String(filters[key]);
    });
  });
}

/**
 * 新しい行を追加
 */
function insertRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const now = new Date().toISOString();
  const id = Utilities.getUuid();

  data.id = id;
  data.created_at = now;
  data.updated_at = now;

  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);
  return { id: id };
}

/**
 * IDで行を更新
 */
function updateRowById(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol = headers.indexOf('id');
  if (idCol === -1) throw new Error('id column not found');

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      data.updated_at = new Date().toISOString();
      headers.forEach((h, col) => {
        if (h !== 'id' && h !== 'created_at' && data[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(data[h]);
        }
      });
      return { success: true };
    }
  }
  throw new Error('Row not found: ' + id);
}

/**
 * IDで行を削除（物理削除）
 */
function deleteRowById(sheetName, id) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error('Row not found: ' + id);
}
