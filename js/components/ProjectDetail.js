/**
 * SFA02 - 案件詳細ページ
 * 案件の全情報を確認・編集する画面
 */

const ProjectDetail = {
  template: `
    <div>
      <!-- パンくず -->
      <div class="page-header">
        <h2>
          <a href="#/projects" style="text-decoration:none; color: var(--color-text-muted); font-size:14px">
            <i class="bi bi-arrow-left"></i> 案件一覧
          </a>
        </h2>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border" role="status"></div>
      </div>

      <div v-if="!loading && !project" class="empty-state">案件が見つかりません</div>

      <div v-if="project && !loading">

        <!-- ヘッダー -->
        <div class="card mb-3" style="border-left: 4px solid var(--color-primary);">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h3 class="mb-1" style="font-size:22px; font-weight:700; color:#1b2a4a;">
                  {{ project.name }}
                </h3>
                <div class="d-flex gap-2 align-items-center mt-1">
                  <span :class="'badge-biz badge-' + project.business_type">{{ project.business_type }}</span>
                  <span :class="'badge-status badge-' + project.status">{{ project.status }}</span>
                  <span v-if="project.is_active" class="text-success" style="font-size:12px"><i class="bi bi-check-circle-fill"></i> 継続中</span>
                  <span v-else class="text-muted" style="font-size:12px"><i class="bi bi-dash-circle"></i> 停止</span>
                </div>
              </div>
            </div>

            <div class="row mt-3" style="font-size:13px;">
              <div class="col-md-4">
                <div class="mb-2"><i class="bi bi-building text-muted"></i> <strong>企業:</strong>
                  <a href="#" @click.prevent="goCompany(project.company_id)">{{ project.company_name }}</a>
                </div>
                <div class="mb-2"><i class="bi bi-diagram-3 text-muted"></i> <strong>部署:</strong> {{ departmentName }}</div>
                <div class="mb-2"><i class="bi bi-person text-muted"></i> <strong>担当:</strong> {{ project.assigned_member_name }}</div>
              </div>
              <div class="col-md-4" v-if="project.business_type === 'DSL'">
                <div class="mb-2"><i class="bi bi-graph-up text-muted"></i> <strong>受注確度:</strong> {{ project.win_rate != null ? project.win_rate + '%' : '-' }}</div>
                <div class="mb-2"><i class="bi bi-currency-yen text-muted"></i> <strong>提案金額:</strong> {{ formatCurrency(project.estimated_revenue) }}</div>
                <div class="mb-2"><i class="bi bi-cash-coin text-muted"></i> <strong>受注金額:</strong> {{ formatCurrency(project.contract_revenue) }}</div>
              </div>
              <div class="col-md-4">
                <div class="mb-2"><i class="bi bi-calendar text-muted"></i> <strong>作成日:</strong> {{ formatDate(project.created_at) }}</div>
                <div class="mb-2" v-if="contractLineName"><i class="bi bi-file-earmark-text text-muted"></i> <strong>契約:</strong> {{ contractLineName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- タブ -->
        <ul class="nav nav-tabs mb-0" style="border-bottom: none;">
          <li class="nav-item" v-for="tab in tabs" :key="tab.key">
            <a class="nav-link" href="#"
               :class="{ active: activeTab === tab.key }"
               @click.prevent="activeTab = tab.key"
               style="font-size:13px;">
              <i :class="'bi bi-' + tab.icon"></i> {{ tab.label }}
              <span v-if="tab.count != null" class="badge bg-secondary ms-1" style="font-size:10px">{{ tab.count }}</span>
            </a>
          </li>
        </ul>

        <div class="card" style="border-top-left-radius:0;">
          <div class="card-body">

            <!-- 商談履歴 -->
            <div v-if="activeTab === 'meetings'">
              <h5 style="font-size:15px; font-weight:600; margin-bottom:12px;">関連商談</h5>
              <div v-if="relatedMeetings.length === 0" class="empty-state" style="padding:20px">関連商談がありません</div>
              <div v-else class="meeting-timeline">
                <div v-for="m in relatedMeetings" :key="m.id" class="card mb-2">
                  <div class="card-body" style="padding: 12px 16px;">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <span class="fw-bold" style="font-size:14px">{{ formatDate(m.meeting_date) }}</span>
                        <span class="badge bg-light text-dark ms-2" style="font-size:11px">{{ m.meeting_type }}</span>
                        <span class="badge bg-light text-dark ms-1" style="font-size:11px">{{ m.meeting_count }}回目</span>
                      </div>
                    </div>
                    <div class="mt-2" style="font-size:13px;">
                      <div v-if="m.summary" class="mb-1">{{ m.summary }}</div>
                      <div v-if="m.next_action" class="text-primary" style="font-size:12px">
                        <i class="bi bi-arrow-right-circle"></i> {{ m.next_action }}
                      </div>
                    </div>
                    <div class="mt-2" style="font-size:11px; color: var(--color-text-muted)">
                      <span><i class="bi bi-person"></i> 取得: {{ m.setter_name }}</span>
                      <span v-if="m.member_names && m.member_names.length" class="ms-3">
                        <i class="bi bi-people"></i> 参加: {{ m.member_names.join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- タスク -->
            <div v-if="activeTab === 'tasks'">
              <h5 style="font-size:15px; font-weight:600; margin-bottom:12px;">関連タスク</h5>
              <div v-if="relatedTasks.length === 0" class="empty-state" style="padding:20px">関連タスクがありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th>タイトル</th>
                      <th>種別</th>
                      <th>期日</th>
                      <th>優先度</th>
                      <th>担当</th>
                      <th>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in relatedTasks" :key="t.id" :class="{ 'row-overdue': isOverdue(t) }">
                      <td>{{ t.title }}</td>
                      <td>
                        <span v-if="t.action_type" class="badge bg-secondary" style="font-size:11px">{{ t.action_type }}</span>
                        <span v-else class="text-muted" style="font-size:12px">タスク</span>
                      </td>
                      <td :class="{ 'text-overdue': isOverdue(t) }">{{ formatDate(t.due_date) }}</td>
                      <td>
                        <span v-if="t.priority" :class="'badge-priority priority-' + t.priority">{{ t.priority }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>{{ t.assigned_member_name }}</td>
                      <td>
                        <span :class="t.status === '完了' ? 'badge bg-success' : 'badge bg-light text-dark'" style="font-size:11px">{{ t.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 求人（PERM/ITSS） -->
            <div v-if="activeTab === 'jobs'">
              <h5 style="font-size:15px; font-weight:600; margin-bottom:12px;">関連求人</h5>
              <div v-if="relatedJobs.length === 0" class="empty-state" style="padding:20px">関連求人がありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th>求人タイトル</th>
                      <th>部署</th>
                      <th>取得日</th>
                      <th>取得担当</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="j in relatedJobs" :key="j.id">
                      <td><strong>{{ j.job_title }}</strong></td>
                      <td>{{ j.department_name || '-' }}</td>
                      <td>{{ formatDate(j.acquired_date) }}</td>
                      <td>{{ j.member_names ? j.member_names.join(', ') : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ステータス履歴 -->
            <div v-if="activeTab === 'history'">
              <h5 style="font-size:15px; font-weight:600; margin-bottom:12px;">ステータス変更履歴</h5>
              <div v-if="statusHistory.length === 0" class="empty-state" style="padding:20px">履歴がありません</div>
              <div v-else>
                <div v-for="h in statusHistory" :key="h.id" class="d-flex align-items-center py-2" style="border-bottom:1px solid #eee; font-size:13px;">
                  <span class="text-muted" style="min-width:100px">{{ formatDate(h.changed_at) }}</span>
                  <span :class="'badge-status badge-' + h.from_status" style="font-size:10px">{{ h.from_status }}</span>
                  <i class="bi bi-arrow-right mx-2 text-muted"></i>
                  <span :class="'badge-status badge-' + h.to_status" style="font-size:10px">{{ h.to_status }}</span>
                  <span class="ms-3 text-muted" style="font-size:12px">{{ h.changed_by_name }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,

  props: ['projectId', 'members'],

  data() {
    return {
      project: null,
      loading: true,
      activeTab: 'meetings',
      allMeetings: [],
      allTasks: [],
      allJobs: [],
      statusHistory: [],
      departments: [],
      contractLines: [],
    };
  },

  computed: {
    tabs() {
      const t = [
        { key: 'meetings', label: '商談', icon: 'calendar-event', count: this.relatedMeetings.length },
        { key: 'tasks', label: 'タスク', icon: 'check2-square', count: this.relatedTasks.length },
      ];
      if (this.project && ['PERM', 'ITSS'].includes(this.project.business_type)) {
        t.push({ key: 'jobs', label: '求人', icon: 'person-badge', count: this.relatedJobs.length });
      }
      t.push({ key: 'history', label: 'ステータス履歴', icon: 'clock-history', count: this.statusHistory.length });
      return t;
    },

    departmentName() {
      if (!this.project || !this.project.department_id) return '-';
      const d = this.departments.find(x => x.id === this.project.department_id);
      return d ? d.name : '-';
    },

    contractLineName() {
      if (!this.project || !this.project.contractline_id) return '';
      const cl = this.contractLines.find(x => x.id === this.project.contractline_id);
      return cl ? cl.business_type + ' - ' + cl.status : '';
    },

    relatedMeetings() {
      return this.allMeetings
        .filter(m => m.project_id === this.projectId)
        .sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
    },

    relatedTasks() {
      return this.allTasks
        .filter(t => t.project_id === this.projectId)
        .sort((a, b) => {
          const aO = this.isOverdue(a) ? 0 : 1;
          const bO = this.isOverdue(b) ? 0 : 1;
          if (aO !== bO) return aO - bO;
          const aD = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
          const bD = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
          return aD - bD;
        });
    },

    relatedJobs() {
      return this.allJobs.filter(j => j.project_id === this.projectId);
    },
  },

  methods: {
    async loadData() {
      this.loading = true;
      const [projects, meetings, tasks, jobs, departments, contractLines, statusHistory] = await Promise.all([
        API.getProjectList(),
        API.getMeetingList(),
        API.getTaskList(),
        API.getJobList(),
        API.getAllDepartments(),
        API.getAllContractLines(),
        API.getProjectStatusHistory ? API.getProjectStatusHistory(this.projectId) : Promise.resolve([]),
      ]);

      this.project = projects.find(p => p.id === this.projectId) || null;
      this.allMeetings = meetings;
      this.allTasks = tasks;
      this.allJobs = jobs;
      this.departments = departments;
      this.contractLines = contractLines;
      this.statusHistory = statusHistory;
      this.loading = false;
    },

    formatDate(d) { return FilterUtils.formatDate(d); },
    formatCurrency(amount) { return FilterUtils.formatCurrency(amount); },
    isOverdue(task) { return task.status !== '完了' && FilterUtils.isOverdue(task.due_date); },
    goCompany(id) { window.location.hash = '#/companies/' + id; },
  },

  async mounted() {
    await this.loadData();
  },

  watch: {
    projectId() { this.loadData(); },
  },
};
