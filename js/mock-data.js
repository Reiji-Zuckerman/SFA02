/**
 * SFA02 - モックデータ
 * GAS Web App 未接続時のフロントエンド動作確認用
 */

const MockData = (() => {
  // UUID生成
  const uuid = () => crypto.randomUUID();

  // 日付ヘルパー
  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };
  const daysLater = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };

  // === メンバー ===
  const members = [
    { id: 'm1', name: '田中太郎', email: 'tanaka@example.com', role: 'IS', is_active: true },
    { id: 'm2', name: '鈴木花子', email: 'suzuki@example.com', role: 'FS', is_active: true },
    { id: 'm3', name: '佐藤次郎', email: 'sato@example.com', role: 'DSL', is_active: true },
    { id: 'm4', name: '山田美咲', email: 'yamada@example.com', role: 'PERM', is_active: true },
    { id: 'm5', name: '高橋健一', email: 'takahashi@example.com', role: 'ITSS', is_active: true },
  ];

  // === 企業 ===
  const companies = [
    { id: 'c1', name: '株式会社テックコープ', name_kana: 'テックコープ', industry: 'IT・通信', phone: '03-1234-5678', address: '東京都千代田区1-1-1', lead_source: 'テレアポ', website_url: 'https://example.com' },
    { id: 'c2', name: '株式会社グローバルHR', name_kana: 'グローバルエイチアール', industry: '人材', phone: '03-2345-6789', address: '東京都港区2-2-2', lead_source: '紹介' },
    { id: 'c3', name: '合同会社デジタルソリューションズ', name_kana: 'デジタルソリューションズ', industry: 'IT・通信', phone: '03-3456-7890', address: '東京都渋谷区3-3-3', lead_source: 'Web' },
    { id: 'c4', name: '株式会社ファイナンスプラス', name_kana: 'ファイナンスプラス', industry: '金融・保険', phone: '03-4567-8901', address: '東京都中央区4-4-4', lead_source: '展示会' },
    { id: 'c5', name: '株式会社メディカルケア', name_kana: 'メディカルケア', industry: '医療・福祉', phone: '03-5678-9012', address: '東京都新宿区5-5-5', lead_source: 'テレアポ' },
    { id: 'c6', name: '株式会社ロジテック', name_kana: 'ロジテック', industry: '物流・運輸', phone: '03-6789-0123', address: '東京都品川区6-6-6', lead_source: 'Web' },
  ];

  // === CompanyMember ===
  const companyMembers = [
    { id: 'cm1', company_id: 'c1', member_id: 'm1', role_in_company: 'IS' },
    { id: 'cm2', company_id: 'c1', member_id: 'm2', role_in_company: 'FS' },
    { id: 'cm3', company_id: 'c1', member_id: 'm3', role_in_company: 'DSL' },
    { id: 'cm4', company_id: 'c2', member_id: 'm2', role_in_company: 'FS' },
    { id: 'cm5', company_id: 'c2', member_id: 'm4', role_in_company: 'PERM' },
    { id: 'cm6', company_id: 'c3', member_id: 'm3', role_in_company: 'DSL' },
    { id: 'cm7', company_id: 'c4', member_id: 'm1', role_in_company: 'IS' },
    { id: 'cm8', company_id: 'c4', member_id: 'm5', role_in_company: 'ITSS' },
    { id: 'cm9', company_id: 'c5', member_id: 'm4', role_in_company: 'PERM' },
    { id: 'cm10', company_id: 'c6', member_id: 'm5', role_in_company: 'ITSS' },
  ];

  // === Contract / ContractLine ===
  const contracts = [
    { id: 'ct1', company_id: 'c1' },
    { id: 'ct2', company_id: 'c2' },
    { id: 'ct3', company_id: 'c3' },
    { id: 'ct4', company_id: 'c4' },
    { id: 'ct5', company_id: 'c5' },
    { id: 'ct6', company_id: 'c6' },
  ];

  const contractLines = [
    { id: 'cl1', contract_id: 'ct1', business_type: 'DSL', status: '進行中' },
    { id: 'cl2', contract_id: 'ct1', business_type: 'PERM', status: '締結済', contracted_date: daysAgo(60) },
    { id: 'cl3', contract_id: 'ct1', business_type: 'ITSS', status: '初回商談' },
    { id: 'cl4', contract_id: 'ct2', business_type: 'PERM', status: '締結済', contracted_date: daysAgo(90) },
    { id: 'cl5', contract_id: 'ct2', business_type: 'ITSS', status: '進行中' },
    { id: 'cl6', contract_id: 'ct3', business_type: 'DSL', status: '締結済', contracted_date: daysAgo(30) },
    { id: 'cl7', contract_id: 'ct4', business_type: 'ITSS', status: '進行中' },
    { id: 'cl8', contract_id: 'ct4', business_type: 'PERM', status: 'リサイクル', lost_reason: '予算なし' },
    { id: 'cl9', contract_id: 'ct5', business_type: 'PERM', status: '初回商談' },
    { id: 'cl10', contract_id: 'ct6', business_type: 'ITSS', status: '締結済', contracted_date: daysAgo(15) },
  ];

  // === Department ===
  const departments = [
    { id: 'd1', company_id: 'c1', name: '情報システム部' },
    { id: 'd2', company_id: 'c1', name: '人事部' },
    { id: 'd3', company_id: 'c2', name: '営業部' },
    { id: 'd4', company_id: 'c3', name: '開発部' },
    { id: 'd5', company_id: 'c4', name: 'IT推進部' },
    { id: 'd6', company_id: 'c5', name: '総務部' },
  ];

  // === Contact ===
  const contacts = [
    { id: 'co1', company_id: 'c1', department_id: 'd1', name: '伊藤部長', name_kana: 'イトウブチョウ', title: '部長', influence_type: '決裁者', email: 'ito@techcorp.example.com', is_active: true },
    { id: 'co2', company_id: 'c1', department_id: 'd2', name: '渡辺課長', name_kana: 'ワタナベカチョウ', title: '課長', influence_type: '担当者', email: 'watanabe@techcorp.example.com', is_active: true },
    { id: 'co3', company_id: 'c2', department_id: 'd3', name: '小林マネージャー', name_kana: 'コバヤシマネージャー', title: 'マネージャー', influence_type: '決裁者', email: 'kobayashi@globalhr.example.com', is_active: true },
    { id: 'co4', company_id: 'c3', department_id: 'd4', name: '加藤リーダー', name_kana: 'カトウリーダー', title: 'テックリード', influence_type: '担当者', email: 'kato@digital.example.com', is_active: true },
    { id: 'co5', company_id: 'c4', department_id: 'd5', name: '松本部長', name_kana: 'マツモトブチョウ', title: '部長', influence_type: '決裁者', is_active: true },
  ];

  // === Project ===
  const projects = [
    { id: 'p1', company_id: 'c1', department_id: 'd1', contractline_id: 'cl1', business_type: 'DSL', name: 'AI導入コンサルティング', status: '提案中', assigned_member_id: 'm3', is_active: true, win_rate: 25, estimated_revenue: 5000000 },
    { id: 'p2', company_id: 'c1', department_id: 'd1', business_type: 'PERM', name: 'バックエンドエンジニア採用', status: '求人取得', assigned_member_id: 'm4', is_active: true },
    { id: 'p3', company_id: 'c2', department_id: 'd3', business_type: 'PERM', name: '営業マネージャー採用', status: 'アプローチ中', assigned_member_id: 'm4', is_active: true },
    { id: 'p4', company_id: 'c3', department_id: 'd4', contractline_id: 'cl6', business_type: 'DSL', name: 'SaaS開発プロジェクト', status: 'PoC', assigned_member_id: 'm3', is_active: true, win_rate: 50, estimated_revenue: 10000000 },
    { id: 'p5', company_id: 'c4', department_id: 'd5', business_type: 'ITSS', name: 'IT基盤刷新', status: 'アプローチ中', assigned_member_id: 'm5', is_active: true },
    { id: 'p6', company_id: 'c1', business_type: 'DSL', name: 'データ分析基盤構築', status: '提案準備中', assigned_member_id: 'm3', is_active: true, win_rate: 10, estimated_revenue: 3000000 },
    { id: 'p7', company_id: 'c5', business_type: 'PERM', name: '看護師採用支援', status: '求人取得', assigned_member_id: 'm4', is_active: true },
    { id: 'p8', company_id: 'c6', business_type: 'ITSS', name: 'インフラエンジニア派遣', status: '求人取得', assigned_member_id: 'm5', is_active: true },
  ];

  // === Meeting ===
  const meetings = [
    { id: 'mt1', company_id: 'c1', project_id: 'p1', setter_member_id: 'm2', meeting_date: daysAgo(7), meeting_type: 'オンライン', meeting_count: 3, summary: 'AI導入の方向性を確認。次回はPoC範囲の提案。', next_action: 'PoC提案書の作成' },
    { id: 'mt2', company_id: 'c1', project_id: 'p1', setter_member_id: 'm2', meeting_date: daysAgo(21), meeting_type: '対面', meeting_count: 2, summary: '要件ヒアリング完了。提案資料を準備する。', next_action: '提案資料の準備' },
    { id: 'mt3', company_id: 'c2', project_id: null, setter_member_id: 'm1', meeting_date: daysAgo(3), meeting_type: 'オンライン', meeting_count: 1, summary: '初回訪問。PERM事業に興味あり。', next_action: '担当者紹介のアレンジ' },
    { id: 'mt4', company_id: 'c3', project_id: 'p4', setter_member_id: 'm2', meeting_date: daysAgo(14), meeting_type: '対面', meeting_count: 2, summary: 'PoC開始に合意。開発環境の準備が必要。', next_action: 'PoC環境セットアップ' },
    { id: 'mt5', company_id: 'c4', project_id: 'p5', setter_member_id: 'm1', meeting_date: daysAgo(5), meeting_type: 'オンライン', meeting_count: 1, summary: 'IT基盤の現状課題をヒアリング。', next_action: '現状分析レポート作成' },
    { id: 'mt6', company_id: 'c1', project_id: null, setter_member_id: 'm1', meeting_date: daysAgo(45), meeting_type: '対面', meeting_count: 1, summary: '初回訪問。複数事業の可能性あり。', next_action: 'DSL担当の紹介' },
    { id: 'mt7', company_id: 'c5', project_id: 'p7', setter_member_id: 'm2', meeting_date: daysAgo(10), meeting_type: 'オンライン', meeting_count: 1, summary: '看護師採用ニーズの確認。', next_action: '求人票の取得' },
    { id: 'mt8', company_id: 'c6', project_id: 'p8', setter_member_id: 'm1', meeting_date: daysAgo(2), meeting_type: '対面', meeting_count: 2, summary: 'インフラエンジニア2名の提案。', next_action: '候補者の面談調整', disqualified_reason: null },
  ];

  const meetingMembers = [
    { id: 'mm1', meeting_id: 'mt1', member_id: 'm2' },
    { id: 'mm2', meeting_id: 'mt1', member_id: 'm3' },
    { id: 'mm3', meeting_id: 'mt2', member_id: 'm2' },
    { id: 'mm4', meeting_id: 'mt3', member_id: 'm1' },
    { id: 'mm5', meeting_id: 'mt4', member_id: 'm2' },
    { id: 'mm6', meeting_id: 'mt4', member_id: 'm3' },
    { id: 'mm7', meeting_id: 'mt5', member_id: 'm1' },
    { id: 'mm8', meeting_id: 'mt5', member_id: 'm5' },
    { id: 'mm9', meeting_id: 'mt6', member_id: 'm1' },
    { id: 'mm10', meeting_id: 'mt7', member_id: 'm2' },
    { id: 'mm11', meeting_id: 'mt7', member_id: 'm4' },
    { id: 'mm12', meeting_id: 'mt8', member_id: 'm1' },
    { id: 'mm13', meeting_id: 'mt8', member_id: 'm5' },
  ];

  const meetingContacts = [
    { id: 'mc1', meeting_id: 'mt1', contact_id: 'co1' },
    { id: 'mc2', meeting_id: 'mt2', contact_id: 'co1' },
    { id: 'mc3', meeting_id: 'mt3', contact_id: 'co3' },
    { id: 'mc4', meeting_id: 'mt4', contact_id: 'co4' },
    { id: 'mc5', meeting_id: 'mt5', contact_id: 'co5' },
    { id: 'mc6', meeting_id: 'mt6', contact_id: 'co1' },
    { id: 'mc7', meeting_id: 'mt6', contact_id: 'co2' },
  ];

  // === Job ===
  const jobs = [
    { id: 'j1', project_id: 'p2', company_id: 'c1', department_id: 'd1', job_title: 'バックエンドエンジニア（Go/AWS）', business_type: 'PERM', acquired_date: daysAgo(20) },
    { id: 'j2', project_id: 'p3', company_id: 'c2', department_id: 'd3', job_title: '営業マネージャー', business_type: 'PERM', acquired_date: daysAgo(10) },
    { id: 'j3', project_id: 'p5', company_id: 'c4', department_id: 'd5', job_title: 'インフラエンジニア', business_type: 'ITSS', acquired_date: daysAgo(5) },
    { id: 'j4', project_id: 'p7', company_id: 'c5', department_id: 'd6', job_title: '看護師（正社員）', business_type: 'PERM', acquired_date: daysAgo(8) },
    { id: 'j5', project_id: 'p8', company_id: 'c6', department_id: null, job_title: 'ネットワークエンジニア', business_type: 'ITSS', acquired_date: daysAgo(15) },
  ];

  const jobMembers = [
    { id: 'jm1', job_id: 'j1', member_id: 'm4' },
    { id: 'jm2', job_id: 'j2', member_id: 'm4' },
    { id: 'jm3', job_id: 'j3', member_id: 'm5' },
    { id: 'jm4', job_id: 'j4', member_id: 'm4' },
    { id: 'jm5', job_id: 'j5', member_id: 'm5' },
  ];

  // === Task ===
  const tasks = [
    { id: 't1', title: 'テックコープ PoC提案書作成', description: 'AI導入PoCの提案書を作成する', due_date: daysLater(2), status: '未着手', priority: '高', action_type: null, assigned_member_id: 'm3', company_id: 'c1', project_id: 'p1' },
    { id: 't2', title: 'グローバルHR 担当者フォロー', description: '紹介後のフォローアップ電話', due_date: daysLater(1), status: '未着手', priority: '高', action_type: '架電', assigned_member_id: 'm2', company_id: 'c2', project_id: null },
    { id: 't3', title: 'ファイナンスプラス 現状分析レポート', description: 'IT基盤の現状分析をまとめる', due_date: daysLater(5), status: '未着手', priority: '中', action_type: '資料作成', assigned_member_id: 'm5', company_id: 'c4', project_id: 'p5' },
    { id: 't4', title: 'テックコープ ITSS初回商談準備', description: '商談資料の準備', due_date: daysLater(3), status: '未着手', priority: '中', action_type: '資料作成', assigned_member_id: 'm5', company_id: 'c1' },
    { id: 't5', title: 'デジタルソリューションズ PoC環境構築', description: 'AWS環境のセットアップ', due_date: daysLater(7), status: '未着手', priority: '高', action_type: '開発', assigned_member_id: 'm3', company_id: 'c3', project_id: 'p4' },
    { id: 't6', title: 'グローバルHR 営業マネージャー候補紹介', due_date: daysAgo(1), status: '未着手', priority: '高', action_type: 'メール', assigned_member_id: 'm4', company_id: 'c2', project_id: 'p3' },
    { id: 't7', title: 'テックコープ BEエンジニア候補サーチ', due_date: daysLater(4), status: '未着手', priority: '中', action_type: 'ピック', assigned_member_id: 'm4', company_id: 'c1', project_id: 'p2' },
    { id: 't8', title: 'メディカルケア 求人票確認', due_date: daysLater(1), status: '未着手', priority: '中', action_type: '架電', assigned_member_id: 'm4', company_id: 'c5', project_id: 'p7' },
    { id: 't9', title: 'ロジテック 候補者面談調整', due_date: daysLater(0), status: '未着手', priority: '高', action_type: 'メール', assigned_member_id: 'm5', company_id: 'c6', project_id: 'p8' },
    { id: 't10', title: 'テックコープ IS架電', due_date: daysAgo(2), status: '完了', priority: null, action_type: '架電', assigned_member_id: 'm1', company_id: 'c1' },
    { id: 't11', title: 'ファイナンスプラス IS架電', due_date: daysAgo(3), status: '完了', priority: null, action_type: '架電', assigned_member_id: 'm1', company_id: 'c4' },
    { id: 't12', title: '新規リスト架電 10件', due_date: daysLater(0), status: '未着手', priority: '中', action_type: '架電', assigned_member_id: 'm1' },
  ];

  // === ハンドラー ===
  function handle(action, params) {
    switch (action) {
      case 'getMemberList':
        return members;

      case 'getCompanyList':
        return companies.map(c => {
          const cms = companyMembers.filter(cm => cm.company_id === c.id);
          const memberNames = cms.map(cm => {
            const m = members.find(x => x.id === cm.member_id);
            return m ? m.name : '';
          }).filter(Boolean);
          const contract = contracts.find(ct => ct.company_id === c.id);
          const cls = contract ? contractLines.filter(cl => cl.contract_id === contract.id) : [];
          const companyMeetings = meetings.filter(m => m.company_id === c.id);
          const lastMeeting = companyMeetings.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0];

          return {
            ...c,
            members: memberNames,
            contract_statuses: {
              ITSS: (cls.find(cl => cl.business_type === 'ITSS') || {}).status || '-',
              PERM: (cls.find(cl => cl.business_type === 'PERM') || {}).status || '-',
              DSL: (cls.find(cl => cl.business_type === 'DSL') || {}).status || '-',
            },
            last_meeting_date: lastMeeting ? lastMeeting.meeting_date : null,
          };
        });

      case 'getCompanyById':
        return companies.find(c => c.id === params.id) || null;

      case 'getMeetingList':
        return meetings.map(m => {
          const company = companies.find(c => c.id === m.company_id);
          const setter = members.find(mb => mb.id === m.setter_member_id);
          const mms = meetingMembers.filter(mm => mm.meeting_id === m.id);
          const mcs = meetingContacts.filter(mc => mc.meeting_id === m.id);
          const project = m.project_id ? projects.find(p => p.id === m.project_id) : null;
          return {
            ...m,
            company_name: company ? company.name : '',
            setter_name: setter ? setter.name : '',
            member_names: mms.map(mm => { const mb = members.find(x => x.id === mm.member_id); return mb ? mb.name : ''; }).filter(Boolean),
            contact_names: mcs.map(mc => { const ct = contacts.find(x => x.id === mc.contact_id); return ct ? ct.name : ''; }).filter(Boolean),
            project_name: project ? project.name : '-',
            is_valid: !m.disqualified_reason,
          };
        });

      case 'getProjectList':
        return projects.map(p => {
          const company = companies.find(c => c.id === p.company_id);
          const member = members.find(m => m.id === p.assigned_member_id);
          return {
            ...p,
            company_name: company ? company.name : '',
            assigned_member_name: member ? member.name : '',
          };
        });

      case 'getJobList':
        return jobs.map(j => {
          const company = companies.find(c => c.id === j.company_id);
          const dept = j.department_id ? departments.find(d => d.id === j.department_id) : null;
          const project = j.project_id ? projects.find(p => p.id === j.project_id) : null;
          const jms = jobMembers.filter(jm => jm.job_id === j.id);
          return {
            ...j,
            company_name: company ? company.name : '',
            department_name: dept ? dept.name : '-',
            project_name: project ? project.name : '-',
            member_names: jms.map(jm => { const m = members.find(x => x.id === jm.member_id); return m ? m.name : ''; }).filter(Boolean),
          };
        });

      case 'getTaskList':
        return tasks.map(t => {
          const company = t.company_id ? companies.find(c => c.id === t.company_id) : null;
          const member = members.find(m => m.id === t.assigned_member_id);
          const project = t.project_id ? projects.find(p => p.id === t.project_id) : null;
          let relatedName = '-';
          if (project) relatedName = project.name;
          return {
            ...t,
            company_name: company ? company.name : '-',
            assigned_member_name: member ? member.name : '',
            related_name: relatedName,
          };
        });

      case 'completeTask': {
        const task = tasks.find(t => t.id === params.id);
        if (task) task.status = '完了';
        return { success: true };
      }

      case 'getDepartmentsByCompany':
        return departments.filter(d => d.company_id === params.companyId);

      case 'getContactsByCompany':
        return contacts.filter(c => c.company_id === params.companyId);

      case 'getContractByCompany': {
        const contract = contracts.find(ct => ct.company_id === params.companyId);
        if (!contract) return { contract: null, lines: [] };
        const lines = contractLines.filter(cl => cl.contract_id === contract.id);
        return { contract, lines };
      }

      case 'getMeetingsByCompany':
        return meetings.filter(m => m.company_id === params.companyId);

      case 'getProjectsByCompany':
        return projects.filter(p => p.company_id === params.companyId);

      case 'getJobsByCompany':
        return jobs.filter(j => j.company_id === params.companyId);

      case 'getTasksByCompany':
        return tasks.filter(t => t.company_id === params.companyId);

      default:
        return { message: 'Mock: action not implemented: ' + action };
    }
  }

  return { handle };
})();
