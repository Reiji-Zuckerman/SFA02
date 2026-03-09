/**
 * SFA02 - API通信レイヤー
 * GAS Web App との通信 / モックデータでの動作を切り替え可能
 */

const API = (() => {
  // GAS Web App の公開URL
  // 1. URLパラメータ ?gas=<URL> で指定可能
  // 2. localStorage に保存済みなら自動で使用
  // 3. 空の場合はモックモードで動作
  const urlParams = new URLSearchParams(window.location.search);
  const gasFromUrl = urlParams.get('gas');
  if (gasFromUrl) localStorage.setItem('SFA02_GAS_URL', gasFromUrl);
  const GAS_API_URL = localStorage.getItem('SFA02_GAS_URL') || '';

  // モックモード（GAS未接続時はtrue）
  const USE_MOCK = !GAS_API_URL;

  /**
   * GAS Web App への GET リクエスト
   */
  async function get(action, params = {}) {
    if (USE_MOCK) return MockData.handle(action, params);

    const query = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${GAS_API_URL}?${query}`, { redirect: 'follow' });
    return res.json();
  }

  /**
   * GAS Web App への POST リクエスト
   */
  async function post(action, body = {}) {
    if (USE_MOCK) return MockData.handle(action, body);

    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body }),
    });
    return res.json();
  }

  // === 公開API ===
  return {
    // 企業
    getCompanyList: (filters) => get('getCompanyList', filters),
    getCompanyById: (id) => get('getCompanyById', { id }),
    createCompany: (data) => post('createCompany', { data }),
    updateCompany: (id, data) => post('updateCompany', { id, data }),

    // 部署
    getDepartmentsByCompany: (companyId) => get('getDepartmentsByCompany', { companyId }),
    createDepartment: (data) => post('createDepartment', { data }),

    // 担当者
    getContactsByCompany: (companyId) => get('getContactsByCompany', { companyId }),
    createContact: (data) => post('createContact', { data }),
    updateContact: (id, data) => post('updateContact', { id, data }),

    // 契約
    getContractByCompany: (companyId) => get('getContractByCompany', { companyId }),
    createContractLine: (data) => post('createContractLine', { data }),
    updateContractLine: (id, data) => post('updateContractLine', { id, data }),

    // 商談
    getMeetingList: (filters) => get('getMeetingList', filters),
    getMeetingsByCompany: (companyId) => get('getMeetingsByCompany', { companyId }),
    createMeeting: (data) => post('createMeeting', { data }),
    updateMeeting: (id, data) => post('updateMeeting', { id, data }),

    // 案件
    getProjectList: (filters) => get('getProjectList', filters),
    getProjectsByCompany: (companyId) => get('getProjectsByCompany', { companyId }),
    createProject: (data) => post('createProject', { data }),
    updateProject: (id, data) => post('updateProject', { id, data }),

    // 求人
    getJobList: (filters) => get('getJobList', filters),
    getJobsByCompany: (companyId) => get('getJobsByCompany', { companyId }),
    createJob: (data) => post('createJob', { data }),

    // タスク
    getTaskList: (filters) => get('getTaskList', filters),
    getTasksByCompany: (companyId) => get('getTasksByCompany', { companyId }),
    createTask: (data) => post('createTask', { data }),
    updateTask: (id, data) => post('updateTask', { id, data }),
    completeTask: (id) => post('completeTask', { id }),

    // メンバー
    getMemberList: () => get('getMemberList'),

    // 全社サマリー
    getDashboardData: (period) => get('getDashboardData', { period }),

    // モーダル用：全データ取得
    getAllContacts: () => get('getAllContacts'),
    getAllDepartments: () => get('getAllDepartments'),
    getAllContractLines: () => get('getAllContractLines'),

    // === 接続管理 ===
    isUsingMock: () => USE_MOCK,
    getGasUrl: () => GAS_API_URL,
    setGasUrl: (url) => {
      if (url) {
        localStorage.setItem('SFA02_GAS_URL', url);
      } else {
        localStorage.removeItem('SFA02_GAS_URL');
      }
      location.reload();
    },
  };
})();
