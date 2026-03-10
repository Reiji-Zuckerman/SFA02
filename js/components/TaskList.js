/**
 * SFA02 - タスク一覧（B-1）
 * メンバーが毎朝開いて「今日やること」を確認する画面
 */

const TaskList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-check2-square"></i> タスク一覧</h2>
        <div class="d-flex gap-2 align-items-center">
          <filter-save screen-key="tasks" :current-filters="filters" @apply="applyFilter"></filter-save>
          <column-toggle screen-key="tasks" :all-columns="allColumns" @update="onColumnsUpdate"></column-toggle>
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
            <i class="bi bi-download"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="showModal = true">
            <i class="bi bi-plus-lg"></i> タスク追加
          </button>
        </div>
      </div>

      <task-modal :show="showModal" :members="members" :companies="companies" :projects="projects" :contract-lines="contractLinesAll" :departments="departments" @close="showModal = false" @saved="onSaved"></task-modal>

      <!-- 月次個人サマリー -->
      <div class="summary-cards" v-if="currentMember">
        <div class="summary-card">
          <div class="label">アクション数（今月）</div>
          <div class="value">{{ summary.actionCount }}</div>
          <div class="sub">{{ summary.actionBreakdown }}</div>
        </div>
        <div class="summary-card" v-for="kpi in summary.roleKpis" :key="kpi.label">
          <div class="label">{{ kpi.label }}</div>
          <div class="value">{{ kpi.value }}</div>
          <div class="sub" v-if="kpi.sub">{{ kpi.sub }}</div>
        </div>
      </div>

      <!-- フィルター -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>担当メンバー</label>
          <select v-model="filters.assigned_member_id">
            <option value="">全員</option>
            <option value="mine">自分のみ</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>ステータス</label>
          <select v-model="filters.status">
            <option value="未着手">未着手のみ</option>
            <option value="">すべて</option>
          </select>
        </div>
        <div class="filter-group">
          <label>優先度</label>
          <select v-model="filters.priority">
            <option value="">すべて</option>
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>期日</label>
          <select v-model="filters.dateRange">
            <option value="">すべて</option>
            <option value="today">今日</option>
            <option value="thisWeek">今週</option>
            <option value="nextWeek">来週</option>
            <option value="overdue">期限超過</option>
          </select>
        </div>
        <div class="filter-group">
          <label>関連事業部</label>
          <select v-model="filters.businessType">
            <option value="">すべて</option>
            <option v-for="bt in businessTypes" :key="bt" :value="bt">{{ bt }}</option>
          </select>
        </div>
      </div>

      <!-- ページネーション情報 -->
      <div class="d-flex justify-content-between align-items-center mb-2" v-if="totalPages > 1" style="font-size:12px; color:var(--color-text-muted)">
        <span>{{ filteredTasks.length }}件中 {{ pageStart }}-{{ pageEnd }}件を表示</span>
        <div class="d-flex gap-1">
          <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage <= 1" @click="currentPage--" style="font-size:11px; padding:2px 8px"><i class="bi bi-chevron-left"></i></button>
          <span style="padding:4px 8px">{{ currentPage }} / {{ totalPages }}</span>
          <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage >= totalPages" @click="currentPage++" style="font-size:11px; padding:2px 8px"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>

      <!-- テーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th v-if="colVisible('title')">タイトル</th>
              <th v-if="colVisible('action_type')">種別</th>
              <th v-if="colVisible('due_date')">期日</th>
              <th v-if="colVisible('priority')">優先度</th>
              <th v-if="colVisible('assigned')">担当</th>
              <th v-if="colVisible('company')">関連企業</th>
              <th v-if="colVisible('related')">関連先</th>
              <th v-if="colVisible('status')">ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedTasks.length === 0">
              <td :colspan="visibleColumns.length + 1" class="empty-state">タスクがありません</td>
            </tr>
            <tr v-for="task in paginatedTasks" :key="task.id"
                :class="{ 'row-overdue': isOverdue(task) }">
              <td>
                <input type="checkbox" class="task-check"
                       :checked="task.status === '完了'"
                       @change="toggleComplete(task)"
                       :disabled="task.status === '完了'">
              </td>
              <td v-if="colVisible('title')">{{ task.title }}</td>
              <td v-if="colVisible('action_type')">
                <span v-if="task.action_type" class="badge bg-secondary" style="font-size:11px">
                  {{ task.action_type }}
                </span>
                <span v-else class="text-muted" style="font-size:12px">タスク</span>
              </td>
              <td v-if="colVisible('due_date')" :class="{ 'text-overdue': isOverdue(task) }">
                {{ formatDate(task.due_date) }}
                <span v-if="isOverdue(task)" style="font-size:10px"> (超過)</span>
              </td>
              <td v-if="colVisible('priority')">
                <span v-if="task.priority" :class="'badge-priority priority-' + task.priority">
                  {{ task.priority }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('assigned')">{{ task.assigned_member_name }}</td>
              <td v-if="colVisible('company')">
                <a v-if="task.company_id" href="#" @click.prevent="goCompany(task.company_id)">
                  {{ task.company_name }}
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('related')">{{ task.related_name }}</td>
              <td v-if="colVisible('status')">
                <span :class="task.status === '完了' ? 'badge bg-success' : 'badge bg-light text-dark'"
                      style="font-size:11px">
                  {{ task.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      tasks: [],
      companies: [],
      projects: [],
      contractLinesAll: [],
      departments: [],
      meetings: [],
      jobs: [],
      loading: true,
      showModal: false,
      priorities: CONSTANTS.PRIORITIES,
      businessTypes: CONSTANTS.BUSINESS_TYPES,
      currentPage: 1,
      perPage: 50,
      filters: {
        assigned_member_id: 'mine',
        status: '未着手',
        priority: '',
        dateRange: '',
        businessType: '',
      },
      allColumns: [
        { key: 'title', label: 'タイトル', required: true },
        { key: 'action_type', label: '種別' },
        { key: 'due_date', label: '期日' },
        { key: 'priority', label: '優先度' },
        { key: 'assigned', label: '担当' },
        { key: 'company', label: '関連企業' },
        { key: 'related', label: '関連先' },
        { key: 'status', label: 'ステータス' },
      ],
      visibleColumns: [],
    };
  },
  computed: {
    currentMember() {
      return this.members.find(m => m.id === this.currentMemberId);
    },
    filteredTasks() {
      let result = [...this.tasks];

      // メンバーフィルター
      if (this.filters.assigned_member_id === 'mine' && this.currentMemberId) {
        result = result.filter(t => t.assigned_member_id === this.currentMemberId);
      } else if (this.filters.assigned_member_id && this.filters.assigned_member_id !== 'mine') {
        result = result.filter(t => t.assigned_member_id === this.filters.assigned_member_id);
      }

      // ステータスフィルター
      if (this.filters.status) {
        result = result.filter(t => t.status === this.filters.status);
      }

      // 優先度フィルター
      if (this.filters.priority) {
        result = result.filter(t => t.priority === this.filters.priority);
      }

      // 日付フィルター
      if (this.filters.dateRange) {
        result = result.filter(t => FilterUtils.matchDateRange(t, this.filters.dateRange));
      }

      // 関連事業部フィルター
      if (this.filters.businessType) {
        result = result.filter(t => {
          if (!t.project_id) return false;
          const project = this.projects.find(p => p.id === t.project_id);
          return project && project.business_type === this.filters.businessType;
        });
      }

      // ソート: 期限超過 → 期日昇順
      result.sort((a, b) => {
        const aOverdue = this.isOverdue(a) ? 0 : 1;
        const bOverdue = this.isOverdue(b) ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        const aDate = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
        const bDate = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
        return aDate - bDate;
      });

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredTasks.length / this.perPage) || 1;
    },
    pageStart() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    pageEnd() {
      return Math.min(this.currentPage * this.perPage, this.filteredTasks.length);
    },
    paginatedTasks() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredTasks.slice(start, start + this.perPage);
    },
    summary() {
      if (!this.currentMember) return { actionCount: 0, actionBreakdown: '', roleKpis: [] };

      const myTasks = this.tasks.filter(t => t.assigned_member_id === this.currentMemberId);
      const thisMonth = myTasks.filter(t => {
        if (!t.created_at && !t.due_date) return false;
        const d = new Date(t.due_date || t.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const completedThisMonth = thisMonth.filter(t => t.status === '完了');
      const actionCount = completedThisMonth.length;

      // アクション種別の内訳
      const typeCounts = {};
      completedThisMonth.forEach(t => {
        const type = t.action_type || 'その他';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      const actionBreakdown = Object.entries(typeCounts).map(([k, v]) => k + ': ' + v).join(' / ') || '-';

      const roleKpis = [];
      const role = this.currentMember.role;

      if (role === 'IS') {
        // アポ設定数 = 今月のMeeting.setter_member_id件数
        const myMeetings = this.meetings.filter(m => {
          if (m.setter_member_id !== this.currentMemberId) return false;
          if (!m.meeting_date) return false;
          const d = new Date(m.meeting_date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        roleKpis.push({ label: 'アポ設定数', value: myMeetings.length });
        // 有効アポ率
        const validMeetings = myMeetings.filter(m => !m.disqualified_reason);
        const validRate = myMeetings.length > 0 ? Math.round((validMeetings.length / myMeetings.length) * 100) : 0;
        roleKpis.push({ label: '有効アポ率', value: validRate + '%' });

      } else if (role === 'FS') {
        // 商談数
        const myMeetings = this.meetings.filter(m => {
          if (!m.member_names) return false;
          const memberName = this.currentMember.name;
          if (!m.member_names.includes(memberName) && m.setter_member_id !== this.currentMemberId) return false;
          if (!m.meeting_date) return false;
          const d = new Date(m.meeting_date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        roleKpis.push({ label: '商談数', value: myMeetings.length });

        // トス数（DSL/PERM/ITSS）
        ['DSL', 'PERM', 'ITSS'].forEach(bt => {
          const tossMeetings = this.meetings.filter(m => {
            if (m.setter_member_id !== this.currentMemberId) return false;
            if (!m.project_id) return false;
            const project = this.projects.find(p => p.id === m.project_id);
            return project && project.business_type === bt;
          });
          roleKpis.push({ label: 'トス数（' + bt + '）', value: tossMeetings.length });
        });

        // 契約締結数
        const contractedCount = this.contractLinesAll.filter(cl => {
          if (cl.status !== '締結済') return false;
          // 今月締結
          if (!cl.contracted_date) return false;
          const d = new Date(cl.contracted_date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        roleKpis.push({ label: '契約締結数', value: contractedCount });

      } else if (role === 'PERM' || role === 'ITSS') {
        // 接触企業数
        const contactedCompanies = new Set(thisMonth.map(t => t.company_id).filter(Boolean));
        roleKpis.push({ label: '接触企業数', value: contactedCompanies.size });

        // 接触部署数
        const contactedDepts = new Set();
        thisMonth.forEach(t => {
          if (t.project_id) {
            const project = this.projects.find(p => p.id === t.project_id);
            if (project && project.department_id) contactedDepts.add(project.department_id);
          }
        });
        roleKpis.push({ label: '接触部署数', value: contactedDepts.size });

        // 求人取得数
        const now = new Date();
        const myJobs = this.jobs.filter(j => {
          if (!j.member_names || !j.member_names.includes(this.currentMember.name)) return false;
          if (!j.acquired_date) return false;
          const d = new Date(j.acquired_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        roleKpis.push({ label: '求人取得数', value: myJobs.length });

        // 稼働中求人数（求人DB読み取り専用 - ダミー表示）
        roleKpis.push({ label: '稼働中求人数', value: '-', sub: '（求人DB参照）' });

        // 鮮度アラート数（取得から30日以上経過 - ダミー表示）
        roleKpis.push({ label: '鮮度アラート数', value: '-', sub: '（求人DB参照）' });

      } else if (role === 'DSL') {
        // 提案数
        const now = new Date();
        const myProposals = this.projects.filter(p => {
          if (p.assigned_member_id !== this.currentMemberId) return false;
          if (p.business_type !== 'DSL') return false;
          return ['提案中', 'PoC', '本提案中', '受注'].includes(p.status);
        });
        roleKpis.push({ label: '提案数', value: myProposals.length });

        // 初回商談→提案までの平均日数（ダミー表示、ProjectStatusHistory使用）
        roleKpis.push({ label: '初回商談→提案 平均日数', value: '-', sub: '（履歴データより算出）' });

        // 提案→本提案までの平均日数
        roleKpis.push({ label: '提案→本提案 平均日数', value: '-', sub: '（履歴データより算出）' });
      }

      return { actionCount, actionBreakdown, roleKpis };
    },
  },
  methods: {
    colVisible(key) {
      return this.visibleColumns.length === 0 || this.visibleColumns.includes(key);
    },
    onColumnsUpdate(cols) {
      this.visibleColumns = cols;
    },
    applyFilter(filters) {
      Object.assign(this.filters, filters);
    },
    async loadData() {
      this.loading = true;
      const [tasks, companies, projects, contractLines, departments, meetings, jobs] = await Promise.all([
        API.getTaskList(),
        API.getCompanyList(),
        API.getProjectList(),
        API.getAllContractLines(),
        API.getAllDepartments(),
        API.getMeetingList(),
        API.getJobList(),
      ]);
      this.tasks = tasks;
      this.companies = companies;
      this.projects = projects;
      this.contractLinesAll = contractLines;
      this.departments = departments;
      this.meetings = meetings;
      this.jobs = jobs;
      this.loading = false;
    },
    async onSaved() {
      this.showModal = false;
      await this.loadData();
    },
    isOverdue(task) {
      return task.status !== '完了' && FilterUtils.isOverdue(task.due_date);
    },
    formatDate(d) {
      return FilterUtils.formatDate(d);
    },
    async toggleComplete(task) {
      await API.completeTask(task.id);
      task.status = '完了';
    },
    goCompany(id) {
      window.location.hash = '#/companies/' + id;
    },
    exportCsv() {
      const headers = ['タイトル', '種別', '期日', '優先度', '担当', '関連企業', '関連先', 'ステータス'];
      const rows = this.filteredTasks.map(t => [
        t.title, t.action_type || 'タスク', t.due_date || '', t.priority || '',
        t.assigned_member_name, t.company_name || '', t.related_name || '', t.status,
      ]);
      CsvUtils.download('tasks', headers, rows);
    },
  },
  async mounted() {
    await this.loadData();
    if (this.currentMemberId) {
      this.filters.assigned_member_id = 'mine';
    }
  },
  watch: {
    currentMemberId() {
      if (this.filters.assigned_member_id === 'mine') {
        this.$forceUpdate();
      }
    },
    'filters.assigned_member_id'() { this.currentPage = 1; },
    'filters.status'() { this.currentPage = 1; },
    'filters.priority'() { this.currentPage = 1; },
    'filters.dateRange'() { this.currentPage = 1; },
    'filters.businessType'() { this.currentPage = 1; },
  },
};
