/**
 * SFA02 - 全社サマリー（C）
 * チーム全体のKPI・活動量・パイプラインを一画面で把握する
 * C-1〜C-5の全セクションを実装
 */

const Dashboard = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-graph-up"></i> 全社サマリー</h2>
        <div class="d-flex gap-2 align-items-center">
          <select v-model="period" class="form-select form-select-sm" style="width:auto; font-size:12px">
            <option value="thisMonth">今月</option>
            <option value="lastMonth">先月</option>
            <option value="quarter">四半期</option>
            <option value="year">年度</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border" role="status"></div>
      </div>

      <div v-if="!loading">

        <!-- ===== C-1: 今月のKPIサマリー ===== -->
        <div class="dashboard-section mb-4">
          <h5 class="dashboard-section-title"><i class="bi bi-speedometer2"></i> KPIサマリー</h5>
          <div class="summary-cards">
            <div class="summary-card" v-for="kpi in kpiCards" :key="kpi.label">
              <div class="label">{{ kpi.label }}</div>
              <div class="value" :style="kpi.color ? 'color:' + kpi.color : ''">{{ kpi.value }}</div>
              <div class="sub" v-if="kpi.sub">{{ kpi.sub }}</div>
            </div>
          </div>
        </div>

        <!-- ===== C-2: メンバー別活動量 ===== -->
        <div class="dashboard-section mb-4">
          <h5 class="dashboard-section-title"><i class="bi bi-people"></i> メンバー別活動量</h5>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>メンバー</th>
                  <th>role</th>
                  <th>アクション数</th>
                  <th>種別内訳</th>
                  <th>商談設定</th>
                  <th>求人取得</th>
                  <th>受注金額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in memberActivity" :key="m.id">
                  <td><strong>{{ m.name }}</strong></td>
                  <td><span :class="'badge-biz badge-' + m.role" style="font-size:10px">{{ m.role }}</span></td>
                  <td>
                    <span class="fw-bold" style="font-size:16px">{{ m.actionCount }}</span>
                    <span class="text-muted" style="font-size:11px">件</span>
                  </td>
                  <td style="font-size:11px">{{ m.actionBreakdown || '-' }}</td>
                  <td>
                    <span v-if="m.role === 'IS'">{{ m.meetingSetCount }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="m.role === 'PERM' || m.role === 'ITSS'">{{ m.jobCount }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="m.role === 'DSL' && m.wonRevenue">{{ formatCurrency(m.wonRevenue) }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== C-3: DSLパイプライン ===== -->
        <div class="dashboard-section mb-4">
          <h5 class="dashboard-section-title"><i class="bi bi-funnel"></i> DSLパイプライン</h5>
          <div class="row">
            <!-- ファネル -->
            <div class="col-md-7">
              <div class="pipeline-funnel">
                <div v-for="stage in pipelineStages" :key="stage.status" class="pipeline-stage">
                  <div class="pipeline-bar" :style="'width:' + stage.barWidth + '%'">
                    <span class="pipeline-label">{{ stage.status }}</span>
                    <span class="pipeline-count">{{ stage.count }}件</span>
                  </div>
                  <span class="pipeline-amount">{{ formatCurrency(stage.totalAmount) }}</span>
                </div>
              </div>
            </div>
            <!-- サマリー -->
            <div class="col-md-5">
              <div class="summary-cards" style="flex-direction:column; gap:8px">
                <div class="summary-card">
                  <div class="label">パイプライン加重金額</div>
                  <div class="value" style="font-size:20px">{{ formatCurrency(pipelineWeighted) }}</div>
                  <div class="sub">提案中案件の金額 × 確度の合計</div>
                </div>
                <div class="summary-card">
                  <div class="label">受注合計金額</div>
                  <div class="value" style="font-size:20px; color:var(--color-success)">{{ formatCurrency(wonTotalAmount) }}</div>
                </div>
                <div class="summary-card">
                  <div class="label">失注件数</div>
                  <div class="value" style="font-size:20px; color:var(--color-danger)">{{ lostCount }}件</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== C-4: 企業エンゲージメント ===== -->
        <div class="dashboard-section mb-4">
          <h5 class="dashboard-section-title"><i class="bi bi-exclamation-triangle"></i> 企業エンゲージメント（要注意リスト）</h5>
          <div class="row">
            <!-- 90日以上未接触 -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header" style="font-size:13px; background:#fff5f5; color:var(--color-danger)">
                  <i class="bi bi-clock-history"></i> 90日以上未接触
                </div>
                <div class="card-body" style="padding:8px 12px; max-height:200px; overflow-y:auto">
                  <div v-if="staleCompanies.length === 0" class="text-muted text-center" style="padding:20px; font-size:12px">なし</div>
                  <div v-for="c in staleCompanies" :key="c.id" class="d-flex justify-content-between align-items-center py-1" style="font-size:12px; border-bottom:1px solid #eee">
                    <a href="#" @click.prevent="goCompany(c.id)" style="font-size:12px">{{ c.name }}</a>
                    <span class="text-muted">{{ c.daysSinceContact }}日前</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 接触多・未契約 -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header" style="font-size:13px; background:#fff3cd; color:#856404">
                  <i class="bi bi-arrow-repeat"></i> 接触多・未契約
                </div>
                <div class="card-body" style="padding:8px 12px; max-height:200px; overflow-y:auto">
                  <div v-if="highTouchNoContract.length === 0" class="text-muted text-center" style="padding:20px; font-size:12px">なし</div>
                  <div v-for="c in highTouchNoContract" :key="c.id" class="d-flex justify-content-between align-items-center py-1" style="font-size:12px; border-bottom:1px solid #eee">
                    <a href="#" @click.prevent="goCompany(c.id)" style="font-size:12px">{{ c.name }}</a>
                    <span class="text-muted">商談{{ c.meetingCount }}回</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- クロスセル候補 -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header" style="font-size:13px; background:#d4edda; color:#155724">
                  <i class="bi bi-arrow-left-right"></i> クロスセル候補
                </div>
                <div class="card-body" style="padding:8px 12px; max-height:200px; overflow-y:auto">
                  <div v-if="crossSellCandidates.length === 0" class="text-muted text-center" style="padding:20px; font-size:12px">なし</div>
                  <div v-for="c in crossSellCandidates" :key="c.id" class="d-flex justify-content-between align-items-center py-1" style="font-size:12px; border-bottom:1px solid #eee">
                    <a href="#" @click.prevent="goCompany(c.id)" style="font-size:12px">{{ c.name }}</a>
                    <span>
                      <span v-for="bt in c.contracted" :key="bt" :class="'badge-biz badge-' + bt" style="font-size:9px; margin-left:2px">{{ bt }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== C-5: PERM/ITSS 接触分析 ===== -->
        <div class="dashboard-section mb-4">
          <h5 class="dashboard-section-title"><i class="bi bi-bar-chart"></i> PERM/ITSS 接触分析</h5>
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header" style="font-size:13px">接触部署ランキング</div>
                <div class="card-body" style="padding:8px 12px; max-height:250px; overflow-y:auto">
                  <div v-if="deptContactRanking.length === 0" class="text-muted text-center" style="padding:20px; font-size:12px">データなし</div>
                  <div v-for="(d, i) in deptContactRanking" :key="i"
                       class="d-flex justify-content-between align-items-center py-1" style="font-size:12px; border-bottom:1px solid #eee">
                    <span>
                      <span class="fw-bold me-1">{{ i + 1 }}.</span>
                      {{ d.companyName }} / {{ d.deptName }}
                    </span>
                    <div>
                      <span class="badge bg-primary">接触{{ d.contactCount }}回</span>
                      <span class="badge bg-success ms-1" v-if="d.jobCount">求人{{ d.jobCount }}件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header" style="font-size:13px">求人取得部署ランキング</div>
                <div class="card-body" style="padding:8px 12px; max-height:250px; overflow-y:auto">
                  <div v-if="deptJobRanking.length === 0" class="text-muted text-center" style="padding:20px; font-size:12px">データなし</div>
                  <div v-for="(d, i) in deptJobRanking" :key="i"
                       class="d-flex justify-content-between align-items-center py-1" style="font-size:12px; border-bottom:1px solid #eee">
                    <span>
                      <span class="fw-bold me-1">{{ i + 1 }}.</span>
                      {{ d.companyName }} / {{ d.deptName }}
                    </span>
                    <div>
                      <span class="badge bg-success">{{ d.jobCount }}件</span>
                      <span class="text-muted ms-2" style="font-size:11px" v-if="d.conversionRate">転換率 {{ d.conversionRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,

  props: ['currentMemberId', 'members'],

  data() {
    return {
      loading: true,
      period: 'thisMonth',
      tasks: [],
      meetings: [],
      projects: [],
      jobs: [],
      companies: [],
      contractLines: [],
      departments: [],
    };
  },

  computed: {
    // === C-1: KPIカード ===
    kpiCards() {
      const cards = [];

      const isMeetings = this.periodMeetings.filter(m => {
        const setter = this.members.find(x => x.id === m.setter_member_id);
        return setter && setter.role === 'IS';
      });
      cards.push({ label: '商談設定数（IS）', value: isMeetings.length, sub: '件' });

      const validMeetings = this.periodMeetings.filter(m => !m.disqualified_reason);
      cards.push({ label: '有効商談数', value: validMeetings.length, sub: '件' });

      const contractedCount = this.contractLines.filter(cl => cl.status === '締結済').length;
      cards.push({ label: '契約締結数', value: contractedCount });

      const dslProposals = this.projects.filter(p =>
        p.business_type === 'DSL' && ['提案中', 'PoC', '本提案中', '受注'].includes(p.status)
      );
      cards.push({ label: 'DSL提案数', value: dslProposals.length });

      const dslWon = this.projects.filter(p => p.business_type === 'DSL' && p.status === '受注');
      const wonAmount = dslWon.reduce((sum, p) => sum + (p.contract_revenue || p.estimated_revenue || 0), 0);
      cards.push({ label: 'DSL受注', value: dslWon.length + '件', sub: this.formatCurrency(wonAmount), color: 'var(--color-success)' });

      const jobCount = this.periodJobs.length;
      cards.push({ label: '求人取得数', value: jobCount, sub: 'PERM/ITSS' });

      return cards;
    },

    periodMeetings() {
      return this.meetings.filter(m => this.inPeriod(m.meeting_date));
    },
    periodJobs() {
      return this.jobs.filter(j => this.inPeriod(j.acquired_date));
    },

    // === C-2: メンバー別活動量 ===
    memberActivity() {
      return this.members.filter(m => m.is_active).map(m => {
        const myTasks = this.tasks.filter(t => t.assigned_member_id === m.id && t.status === '完了');
        const actionCount = myTasks.length;

        const typeCounts = {};
        myTasks.forEach(t => {
          const type = t.action_type || 'その他';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        const actionBreakdown = Object.entries(typeCounts).map(([k, v]) => k + ':' + v).join(' ');

        const meetingSetCount = this.periodMeetings.filter(mt => mt.setter_member_id === m.id).length;

        const jobCount = this.periodJobs.filter(j =>
          (j.member_names && j.member_names.includes(m.name))
        ).length;

        const wonRevenue = this.projects
          .filter(p => p.business_type === 'DSL' && p.status === '受注' && p.assigned_member_id === m.id)
          .reduce((sum, p) => sum + (p.contract_revenue || p.estimated_revenue || 0), 0);

        return { ...m, actionCount, actionBreakdown, meetingSetCount, jobCount, wonRevenue };
      });
    },

    // === C-3: DSLパイプライン ===
    pipelineStages() {
      const statuses = ['提案準備中', '提案中', 'PoC', '本提案中', '受注', '失注'];
      const dslProjects = this.projects.filter(p => p.business_type === 'DSL');
      const maxCount = Math.max(...statuses.map(s => dslProjects.filter(p => p.status === s).length), 1);

      return statuses.map(status => {
        const matching = dslProjects.filter(p => p.status === status);
        return {
          status,
          count: matching.length,
          totalAmount: matching.reduce((sum, p) => sum + (p.estimated_revenue || 0), 0),
          barWidth: Math.max((matching.length / maxCount) * 100, 8),
        };
      });
    },

    pipelineWeighted() {
      return this.projects
        .filter(p => p.business_type === 'DSL' && !['受注', '失注'].includes(p.status))
        .reduce((sum, p) => sum + ((p.estimated_revenue || 0) * (p.win_rate || 0) / 100), 0);
    },

    wonTotalAmount() {
      return this.projects
        .filter(p => p.business_type === 'DSL' && p.status === '受注')
        .reduce((sum, p) => sum + (p.contract_revenue || p.estimated_revenue || 0), 0);
    },

    lostCount() {
      return this.projects.filter(p => p.business_type === 'DSL' && p.status === '失注').length;
    },

    // === C-4: 企業エンゲージメント ===
    staleCompanies() {
      const now = new Date();
      return this.companies
        .filter(c => {
          if (!c.last_meeting_date) return true;
          const diff = (now - new Date(c.last_meeting_date)) / (1000 * 60 * 60 * 24);
          return diff >= 90;
        })
        .map(c => {
          const diff = c.last_meeting_date
            ? Math.floor((now - new Date(c.last_meeting_date)) / (1000 * 60 * 60 * 24))
            : 999;
          return { id: c.id, name: c.name, daysSinceContact: diff };
        })
        .sort((a, b) => b.daysSinceContact - a.daysSinceContact)
        .slice(0, 10);
    },

    highTouchNoContract() {
      return this.companies
        .filter(c => {
          const meetingCount = this.meetings.filter(m => m.company_id === c.id).length;
          const hasContract = this.contractLines.some(cl => cl.company_id === c.id && cl.status === '締結済');
          return meetingCount >= 3 && !hasContract;
        })
        .map(c => ({
          id: c.id,
          name: c.name,
          meetingCount: this.meetings.filter(m => m.company_id === c.id).length,
        }))
        .sort((a, b) => b.meetingCount - a.meetingCount)
        .slice(0, 10);
    },

    crossSellCandidates() {
      return this.companies
        .filter(c => {
          const cls = this.contractLines.filter(cl => cl.company_id === c.id);
          const contracted = cls.filter(cl => cl.status === '締結済');
          const allTypes = cls.map(cl => cl.business_type);
          return contracted.length >= 1 && contracted.length < 3 &&
            ['DSL', 'PERM', 'ITSS'].some(bt => !allTypes.includes(bt));
        })
        .map(c => {
          const cls = this.contractLines.filter(cl => cl.company_id === c.id);
          const contracted = cls.filter(cl => cl.status === '締結済').map(cl => cl.business_type);
          return { id: c.id, name: c.name, contracted };
        })
        .slice(0, 10);
    },

    // === C-5: PERM/ITSS接触分析 ===
    deptContactRanking() {
      const deptMap = {};
      this.meetings.forEach(m => {
        const project = this.projects.find(p => p.id === m.project_id);
        if (!project || !project.department_id) return;
        if (!['PERM', 'ITSS'].includes(project.business_type)) return;
        const key = project.company_id + '_' + project.department_id;
        if (!deptMap[key]) {
          const company = this.companies.find(c => c.id === project.company_id);
          const dept = this.departments.find(d => d.id === project.department_id);
          deptMap[key] = {
            companyName: company ? company.name : '-',
            deptName: dept ? dept.name : '-',
            contactCount: 0,
            jobCount: 0,
          };
        }
        deptMap[key].contactCount++;
      });

      this.jobs.forEach(j => {
        if (!j.department_id || !j.company_id) return;
        const key = j.company_id + '_' + j.department_id;
        if (deptMap[key]) deptMap[key].jobCount++;
      });

      return Object.values(deptMap)
        .sort((a, b) => b.contactCount - a.contactCount)
        .slice(0, 10);
    },

    deptJobRanking() {
      const deptMap = {};
      this.jobs.forEach(j => {
        if (!j.department_id || !j.company_id) return;
        if (!['PERM', 'ITSS'].includes(j.business_type)) return;
        const key = j.company_id + '_' + j.department_id;
        if (!deptMap[key]) {
          const company = this.companies.find(c => c.id === j.company_id);
          const dept = this.departments.find(d => d.id === j.department_id);
          deptMap[key] = {
            companyName: company ? company.name : '-',
            deptName: dept ? dept.name : '-',
            jobCount: 0,
            contactCount: 0,
          };
        }
        deptMap[key].jobCount++;
      });

      this.meetings.forEach(m => {
        const project = this.projects.find(p => p.id === m.project_id);
        if (!project || !project.department_id) return;
        const key = project.company_id + '_' + project.department_id;
        if (deptMap[key]) deptMap[key].contactCount++;
      });

      return Object.values(deptMap)
        .map(d => ({
          ...d,
          conversionRate: d.contactCount > 0 ? Math.round((d.jobCount / d.contactCount) * 100) : null,
        }))
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 10);
    },
  },

  methods: {
    async loadData() {
      this.loading = true;
      const [tasks, meetings, projects, jobs, companies, contractLines, departments] = await Promise.all([
        API.getTaskList(),
        API.getMeetingList(),
        API.getProjectList(),
        API.getJobList(),
        API.getCompanyList(),
        API.getAllContractLines(),
        API.getAllDepartments(),
      ]);
      this.tasks = tasks;
      this.meetings = meetings;
      this.projects = projects;
      this.jobs = jobs;
      this.companies = companies;
      this.contractLines = contractLines;
      this.departments = departments;
      this.loading = false;
    },

    inPeriod(dateStr) {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const now = new Date();

      switch (this.period) {
        case 'thisMonth':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'lastMonth': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        }
        case 'quarter': {
          const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          return d >= qStart && d <= now;
        }
        case 'year': {
          const fyStart = now.getMonth() >= 3
            ? new Date(now.getFullYear(), 3, 1)
            : new Date(now.getFullYear() - 1, 3, 1);
          return d >= fyStart && d <= now;
        }
        default:
          return true;
      }
    },

    formatCurrency(amount) {
      return FilterUtils.formatCurrency(amount);
    },

    goCompany(id) {
      window.location.hash = '#/companies/' + id;
    },
  },

  async mounted() {
    await this.loadData();
  },
};
