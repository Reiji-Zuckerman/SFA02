/**
 * SFA02 - スプレッドシート初期化スクリプト
 * 初回セットアップ時に実行してシートとヘッダー行を自動作成する
 */

function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheets = {
    Member: ['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'],
    Company: ['id', 'name', 'name_kana', 'industry', 'website_url', 'phone', 'address', 'lead_source', 'referred_by_contact_id', 'created_at', 'updated_at'],
    CompanyMember: ['id', 'company_id', 'member_id', 'role_in_company'],
    Contract: ['id', 'company_id', 'created_at', 'updated_at'],
    ContractLine: ['id', 'contract_id', 'business_type', 'status', 'contracted_date', 'lost_reason', 'created_at', 'updated_at'],
    Department: ['id', 'company_id', 'name', 'created_at', 'updated_at'],
    Contact: ['id', 'company_id', 'department_id', 'name', 'name_kana', 'title', 'influence_type', 'email', 'phone', 'is_active', 'created_at', 'updated_at'],
    Meeting: ['id', 'company_id', 'project_id', 'setter_member_id', 'parent_meeting_id', 'meeting_date', 'meeting_type', 'meeting_count', 'summary', 'next_action', 'disqualified_reason', 'created_at', 'updated_at'],
    MeetingMember: ['id', 'meeting_id', 'member_id'],
    MeetingContact: ['id', 'meeting_id', 'contact_id'],
    Project: ['id', 'company_id', 'department_id', 'contractline_id', 'business_type', 'name', 'status', 'assigned_member_id', 'is_active', 'win_rate', 'estimated_revenue', 'contract_revenue', 'estimated_gross_profit', 'lost_reason', 'created_at', 'updated_at'],
    ProjectStatusHistory: ['id', 'project_id', 'status_from', 'status_to', 'changed_at', 'changed_by_member_id'],
    Job: ['id', 'project_id', 'company_id', 'department_id', 'job_title', 'business_type', 'acquired_date', 'created_at', 'updated_at'],
    JobMember: ['id', 'job_id', 'member_id'],
    JobContact: ['id', 'job_id', 'contact_id'],
    Task: ['id', 'title', 'description', 'due_date', 'status', 'priority', 'action_type', 'assigned_member_id', 'company_id', 'department_id', 'project_id', 'contract_id', 'created_at', 'updated_at'],
  };

  // デフォルトの「シート1」を削除するため、まず全シートを作成
  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // ヘッダー行を設定
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // ヘッダー行を太字・背景色設定
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    // 列幅を自動調整
    headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
    // 1行目を固定
    sheet.setFrozenRows(1);
  });

  // デフォルトの「シート1」を削除
  const defaultSheet = ss.getSheetByName('シート1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Initialization complete: ' + Object.keys(sheets).length + ' sheets created.');
}

/**
 * サンプルデータを投入する（開発・テスト用）
 */
function insertSampleData() {
  // メンバー
  const memberData = [
    { name: '田中太郎', email: 'tanaka@example.com', role: 'IS' },
    { name: '鈴木花子', email: 'suzuki@example.com', role: 'FS' },
    { name: '佐藤次郎', email: 'sato@example.com', role: 'DSL' },
    { name: '山田美咲', email: 'yamada@example.com', role: 'PERM' },
    { name: '高橋健一', email: 'takahashi@example.com', role: 'ITSS' },
  ];
  const memberIds = memberData.map(d => {
    d.is_active = true;
    return insertRow('Member', d).id;
  });

  // 企業
  const companyData = [
    { name: '株式会社テックコープ', name_kana: 'テックコープ', industry: 'IT・通信', phone: '03-1234-5678', lead_source: 'テレアポ' },
    { name: '株式会社グローバルHR', name_kana: 'グローバルエイチアール', industry: '人材', phone: '03-2345-6789', lead_source: '紹介' },
    { name: '合同会社デジタルソリューションズ', name_kana: 'デジタルソリューションズ', industry: 'IT・通信', phone: '03-3456-7890', lead_source: 'Web' },
  ];
  const companyIds = companyData.map(d => insertRow('Company', d).id);

  Logger.log('Sample data inserted. Members: ' + memberIds.length + ', Companies: ' + companyIds.length);
}
