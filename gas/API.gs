/**
 * SFA02 - APIルーティング
 * フロントエンドから呼び出されるアクション定義
 */

const API_HANDLERS = {
  // ===== 企業 =====
  getCompanyList: (params) => {
    const companies = getAllRows('Company');
    const companyMembers = getAllRows('CompanyMember');
    const members = getAllRows('Member');
    const contractLines = getAllRows('ContractLine');
    const contracts = getAllRows('Contract');
    const meetings = getAllRows('Meeting');

    return companies.map(c => {
      const cms = companyMembers.filter(cm => cm.company_id === c.id);
      const memberNames = cms.map(cm => {
        const m = members.find(m => m.id === cm.member_id);
        return m ? m.name : '';
      }).filter(Boolean);

      const contract = contracts.find(ct => ct.company_id === c.id);
      const cls = contract ? contractLines.filter(cl => cl.contract_id === contract.id) : [];

      const companyMeetings = meetings.filter(m => m.company_id === c.id);
      const lastMeeting = companyMeetings.sort((a, b) =>
        new Date(b.meeting_date) - new Date(a.meeting_date)
      )[0];

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
  },

  getCompanyById: (params) => {
    const company = getRowById('Company', params.id);
    if (!company) throw new Error('Company not found');
    return company;
  },

  createCompany: (params) => {
    const company = insertRow('Company', params.data);
    // CompanyMember 中間テーブル自動作成
    if (params.data.members_data && Array.isArray(params.data.members_data)) {
      params.data.members_data.forEach(md => {
        insertRow('CompanyMember', {
          company_id: company.id,
          member_id: md.member_id,
          role_in_company: md.role_in_company || '',
        });
      });
    }
    // Contract レコード自動作成（初回）
    const existingContracts = getRowsWhere('Contract', { company_id: company.id });
    if (existingContracts.length === 0) {
      insertRow('Contract', { company_id: company.id });
    }
    return company;
  },
  updateCompany: (params) => updateRowById('Company', params.id, params.data),

  // ===== 部署 =====
  getDepartmentsByCompany: (params) => getRowsWhere('Department', { company_id: params.companyId }),
  createDepartment: (params) => insertRow('Department', params.data),

  // ===== 担当者 =====
  getContactsByCompany: (params) => getRowsWhere('Contact', { company_id: params.companyId }),
  createContact: (params) => insertRow('Contact', params.data),
  updateContact: (params) => updateRowById('Contact', params.id, params.data),

  // ===== 契約 =====
  getContractByCompany: (params) => {
    const contracts = getRowsWhere('Contract', { company_id: params.companyId });
    if (contracts.length === 0) return { contract: null, lines: [] };
    const contract = contracts[0];
    const lines = getRowsWhere('ContractLine', { contract_id: contract.id });
    return { contract, lines };
  },
  createContractLine: (params) => insertRow('ContractLine', params.data),
  updateContractLine: (params) => updateRowById('ContractLine', params.id, params.data),

  // ===== 商談 =====
  getMeetingList: (params) => {
    const meetings = getAllRows('Meeting');
    const companies = getAllRows('Company');
    const members = getAllRows('Member');
    const meetingMembers = getAllRows('MeetingMember');
    const meetingContacts = getAllRows('MeetingContact');
    const contacts = getAllRows('Contact');
    const projects = getAllRows('Project');

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
        member_names: mms.map(mm => {
          const mb = members.find(x => x.id === mm.member_id);
          return mb ? mb.name : '';
        }).filter(Boolean),
        contact_names: mcs.map(mc => {
          const ct = contacts.find(x => x.id === mc.contact_id);
          return ct ? ct.name : '';
        }).filter(Boolean),
        project_name: project ? project.name : '-',
        is_valid: !m.disqualified_reason,
      };
    });
  },

  getMeetingsByCompany: (params) => getRowsWhere('Meeting', { company_id: params.companyId }),
  createMeeting: (params) => {
    // 商談回数の自動採番
    const existing = getRowsWhere('Meeting', { company_id: params.data.company_id });
    const data = { ...params.data };
    const memberIds = data.member_ids || [];
    const contactIds = data.contact_ids || [];
    delete data.member_ids;
    delete data.contact_ids;
    data.meeting_count = existing.length + 1;
    const meeting = insertRow('Meeting', data);
    // MeetingMember 中間テーブル
    memberIds.forEach(mid => {
      insertRow('MeetingMember', { meeting_id: meeting.id, member_id: mid });
    });
    // MeetingContact 中間テーブル
    contactIds.forEach(cid => {
      insertRow('MeetingContact', { meeting_id: meeting.id, contact_id: cid });
    });
    return meeting;
  },
  updateMeeting: (params) => updateRowById('Meeting', params.id, params.data),

  // ===== 案件 =====
  getProjectList: (params) => {
    const projects = getAllRows('Project');
    const companies = getAllRows('Company');
    const members = getAllRows('Member');

    return projects.map(p => {
      const company = companies.find(c => c.id === p.company_id);
      const member = members.find(m => m.id === p.assigned_member_id);
      return {
        ...p,
        company_name: company ? company.name : '',
        assigned_member_name: member ? member.name : '',
      };
    });
  },

  getProjectsByCompany: (params) => getRowsWhere('Project', { company_id: params.companyId }),
  createProject: (params) => insertRow('Project', params.data),
  updateProject: (params) => {
    // ステータス変更履歴の自動記録
    const current = getRowById('Project', params.id);
    if (current && params.data.status && current.status !== params.data.status) {
      insertRow('ProjectStatusHistory', {
        project_id: params.id,
        status_from: current.status,
        status_to: params.data.status,
        changed_at: new Date().toISOString(),
        changed_by_member_id: params.data._changed_by || '',
      });
      // DSL受注時のContractLine自動更新
      if (params.data.status === '受注' && current.business_type === 'DSL' && current.contractline_id) {
        updateRowById('ContractLine', current.contractline_id, { status: '締結済', contracted_date: new Date().toISOString().split('T')[0] });
      }
    }
    delete params.data._changed_by;
    return updateRowById('Project', params.id, params.data);
  },

  // ===== 求人 =====
  getJobList: (params) => {
    const jobs = getAllRows('Job');
    const companies = getAllRows('Company');
    const departments = getAllRows('Department');
    const projects = getAllRows('Project');
    const jobMembers = getAllRows('JobMember');
    const members = getAllRows('Member');

    return jobs.map(j => {
      const company = companies.find(c => c.id === j.company_id);
      const dept = j.department_id ? departments.find(d => d.id === j.department_id) : null;
      const project = j.project_id ? projects.find(p => p.id === j.project_id) : null;
      const jms = jobMembers.filter(jm => jm.job_id === j.id);
      const memberNames = jms.map(jm => {
        const m = members.find(x => x.id === jm.member_id);
        return m ? m.name : '';
      }).filter(Boolean);

      return {
        ...j,
        company_name: company ? company.name : '',
        department_name: dept ? dept.name : '-',
        project_name: project ? project.name : '-',
        member_names: memberNames,
      };
    });
  },

  getJobsByCompany: (params) => getRowsWhere('Job', { company_id: params.companyId }),
  createJob: (params) => {
    const data = { ...params.data };
    const memberIds = data.member_ids || [];
    const contactIds = data.contact_ids || [];
    delete data.member_ids;
    delete data.contact_ids;
    const job = insertRow('Job', data);
    // JobMember 中間テーブル
    memberIds.forEach(mid => {
      insertRow('JobMember', { job_id: job.id, member_id: mid });
    });
    return job;
  },

  // ===== タスク =====
  getTaskList: (params) => {
    const tasks = getAllRows('Task');
    const companies = getAllRows('Company');
    const members = getAllRows('Member');
    const projects = getAllRows('Project');
    const contracts = getAllRows('Contract');
    const contractLines = getAllRows('ContractLine');

    return tasks.map(t => {
      const company = t.company_id ? companies.find(c => c.id === t.company_id) : null;
      const member = members.find(m => m.id === t.assigned_member_id);
      const project = t.project_id ? projects.find(p => p.id === t.project_id) : null;
      let relatedName = '-';
      if (project) {
        relatedName = project.name;
      } else if (t.contract_id) {
        const contract = contracts.find(c => c.id === t.contract_id);
        if (contract) {
          const cls = contractLines.filter(cl => cl.contract_id === contract.id);
          relatedName = cls.map(cl => cl.business_type).join('/') + '契約';
        }
      }

      return {
        ...t,
        company_name: company ? company.name : '-',
        assigned_member_name: member ? member.name : '',
        related_name: relatedName,
      };
    });
  },

  getTasksByCompany: (params) => getRowsWhere('Task', { company_id: params.companyId }),
  createTask: (params) => insertRow('Task', params.data),
  updateTask: (params) => updateRowById('Task', params.id, params.data),
  completeTask: (params) => updateRowById('Task', params.id, { status: '完了' }),

  // ===== メンバー =====
  getMemberList: () => getAllRows('Member'),

  // ===== 全データ取得（モーダル用） =====
  getAllContacts: () => {
    const contacts = getAllRows('Contact');
    const companies = getAllRows('Company');
    return contacts.map(c => {
      const company = companies.find(co => co.id === c.company_id);
      return { ...c, company_name: company ? company.name : '' };
    });
  },

  getAllDepartments: () => getAllRows('Department'),

  getAllContractLines: () => {
    const contractLines = getAllRows('ContractLine');
    const contracts = getAllRows('Contract');
    const companies = getAllRows('Company');
    return contractLines.map(cl => {
      const contract = contracts.find(c => c.id === cl.contract_id);
      const company = contract ? companies.find(co => co.id === contract.company_id) : null;
      return {
        ...cl,
        company_id: contract ? contract.company_id : '',
        company_name: company ? company.name : '',
      };
    });
  },

  // ===== 全社サマリー =====
  getDashboardData: () => {
    // ダッシュボードはフロントエンドで集計するため、全データを返す
    return { message: 'Dashboard computed client-side' };
  },
};
