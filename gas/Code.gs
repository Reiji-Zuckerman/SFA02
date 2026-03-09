/**
 * SFA02 - Google Apps Script エントリーポイント
 * Web App として公開し、フロントエンド（GitHub Pages）からfetchで呼び出す
 */

const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

function doGet(e) {
  const action = e.parameter.action;
  if (!action) {
    return jsonResponse({ error: 'action parameter is required' }, 400);
  }

  try {
    const handler = API_HANDLERS[action];
    if (!handler) {
      return jsonResponse({ error: 'Unknown action: ' + action }, 404);
    }
    const result = handler(e.parameter);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const action = body.action;
  if (!action) {
    return jsonResponse({ error: 'action parameter is required' }, 400);
  }

  try {
    const handler = API_HANDLERS[action];
    if (!handler) {
      return jsonResponse({ error: 'Unknown action: ' + action }, 404);
    }
    const result = handler(body);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function jsonResponse(data, status) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
