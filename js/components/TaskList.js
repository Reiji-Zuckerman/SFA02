/**
 * SFA02 - タスク一覧（B-1）
 * メンバーが毎朝開いて「今日やること」を確認する画面
 */

const TaskList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-check2-square"></i> タスク一覧</h2>
        <button class="btn btn-primary btn-sm" @click="showModal = true">
          <i class="bi bi-plus-lg"></i> タスク追加
        </button>
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
      </div>

      <!-- テーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th>タイトル</th>
              <th>種別</th>
              <th>期日</th>
              <th>優先度</th>
              <th>担当</th>
              <th>関連企業</th>
              <th>関連先</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredTasks.length === 0">
              <td colspan="9" class="empty-state">タスクがありません</td>
            </tr>
            <tr v-for="task in filteredTasks" :key="task.id"
                :class="{ 'row-overdue': isOverdue(task) }">
              <td>
                <input type="checkbox" class="task-check"
                       :checked="task.status === '完了'"
                       @change="toggleComplete(task)"
                       :disabled="task.status === '完了'">
              </td>
              <td>{{ task.title }}</td>
              <td>
                <span v-if="task.action_type" class="badge bg-secondary" style="font-size:11px">
                  {{ task.action_type }}
                </span>
                <span v-else class="text-muted" style="font-size:12px">タスク</span>
              </td>
              <td :class="{ 'text-overdue': isOverdue(task) }">
                {{ formatDate(task.due_date) }}
                <span v-if="isOverdue(task)" style="font-size:10px"> (超過)</span>
              </td>
              <td>
                <span v-if="task.priority" :class="'badge-priority priority-' + task.priority">
                  {{ task.priority }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ task.assigned_member_name }}</td>
              <td>
                <a v-if="task.company_id" href="#" @click.prevent="goCompany(task.company_id)">
                  {{ task.company_name }}
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ task.related_name }}</td>
              <td>
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
      loading: true,
      showModal: false,
      priorities: CONSTANTS.PRIORITIES,
      filters: {
        assigned_member_id: 'mine',
        status: '未着手',
        priority: '',
        dateRange: '',
      },
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
        roleKpis.push({ label: 'アポ設定数', value: '-', sub: '（GAS接続後に表示）' });
      } else if (role === 'FS') {
        roleKpis.push({ label: '商談数', value: '-', sub: '（GAS接続後に表示）' });
        roleKpis.push({ label: '契約締結数', value: '-' });
      } else if (role === 'PERM' || role === 'ITSS') {
        roleKpis.push({ label: '接触企業数', value: '-' });
        roleKpis.push({ label: '求人取得数', value: '-' });
      } else if (role === 'DSL') {
        roleKpis.push({ label: '提案数', value: '-' });
      }

      return { actionCount, actionBreakdown, roleKpis };
    },
  },
  methods: {
    async loadData() {
      this.loading = true;
      const [tasks, companies, projects, contractLines, departments] = await Promise.all([
        API.getTaskList(),
        API.getCompanyList(),
        API.getProjectList(),
        API.getAllContractLines(),
        API.getAllDepartments(),
      ]);
      this.tasks = tasks;
      this.companies = companies;
      this.projects = projects;
      this.contractLinesAll = contractLines;
      this.departments = departments;
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
  },
  async mounted() {
    await this.loadData();
    // デフォルト: 自分のタスク
    if (this.currentMemberId) {
      this.filters.assigned_member_id = 'mine';
    }
  },
  watch: {
    currentMemberId() {
      if (this.filters.assigned_member_id === 'mine') {
        // 再描画のため
        this.$forceUpdate();
      }
    },
  },
};
