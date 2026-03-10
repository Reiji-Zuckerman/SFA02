/**
 * SFA02 - 案件一覧（B-4）
 * 事業部ごとの案件進捗をパイプラインで把握する
 */

const ProjectList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-kanban"></i> 案件一覧</h2>
        <div class="d-flex gap-2 align-items-center">
          <div class="view-toggle btn-group btn-group-sm" v-if="filters.business_type === 'DSL'">
            <button class="btn" :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="viewMode = 'list'">
              <i class="bi bi-list-ul"></i> リスト
            </button>
            <button class="btn" :class="viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="viewMode = 'kanban'">
              <i class="bi bi-kanban"></i> カンバン
            </button>
          </div>
          <filter-save screen-key="projects" :current-filters="filters" @apply="applyFilter"></filter-save>
          <column-toggle screen-key="projects" :all-columns="allColumns" @update="onColumnsUpdate"></column-toggle>
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
            <i class="bi bi-download"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="showModal = true">
            <i class="bi bi-plus-lg"></i> 案件追加
          </button>
        </div>
      </div>

      <project-modal :show="showModal" :members="members" :companies="companies" :departments="departments" :contract-lines="contractLinesAll" @close="showModal = false" @saved="onSaved"></project-modal>

      <!-- フィルター -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>事業区分</label>
          <select v-model="filters.business_type">
            <option value="">すべて</option>
            <option v-for="bt in businessTypes" :key="bt" :value="bt">{{ bt }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>担当メンバー</label>
          <select v-model="filters.assigned_member_id">
            <option value="">全員</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>ステータス</label>
          <select v-model="filters.status">
            <option value="">すべて</option>
            <option v-for="s in availableStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>継続中</label>
          <select v-model="filters.is_active">
            <option value="true">継続中のみ</option>
            <option value="">すべて</option>
          </select>
        </div>
        <div class="filter-group" v-if="!filters.business_type || filters.business_type === 'DSL'">
          <label>受注確度（DSL）</label>
          <select v-model="filters.winRateMin">
            <option value="">すべて</option>
            <option value="50">50%以上</option>
            <option value="75">75%以上</option>
          </select>
        </div>
      </div>

      <!-- カンバン表示（DSL限定） -->
      <div v-if="viewMode === 'kanban' && filters.business_type === 'DSL'" class="kanban-board">
        <div v-for="status in dslStatuses" :key="status" class="kanban-column">
          <div class="kanban-column-header">
            {{ status }}
            <span class="text-muted">({{ kanbanData[status] ? kanbanData[status].length : 0 }})</span>
          </div>
          <div v-for="p in (kanbanData[status] || [])" :key="p.id" class="kanban-card"
               @click="goDetail(p.id)">
            <div class="company-name">{{ p.company_name }}</div>
            <div class="project-name">{{ p.name }}</div>
            <div class="amount" v-if="p.estimated_revenue">{{ formatCurrency(p.estimated_revenue) }}</div>
            <div class="win-rate" v-if="p.win_rate != null">確度: {{ p.win_rate }}%</div>
            <div class="text-muted" style="font-size:11px; margin-top:4px">{{ p.assigned_member_name }}</div>
          </div>
          <div v-if="!kanbanData[status] || kanbanData[status].length === 0"
               class="text-muted" style="font-size:12px; text-align:center; padding:20px">
            なし
          </div>
        </div>
      </div>

      <!-- リスト表示 -->
      <div v-else>
        <!-- ページネーション -->
        <div class="d-flex justify-content-between align-items-center mb-2" v-if="totalPages > 1" style="font-size:12px; color:var(--color-text-muted)">
          <span>{{ filteredProjects.length }}件中 {{ pageStart }}-{{ pageEnd }}件を表示</span>
          <div class="d-flex gap-1">
            <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage <= 1" @click="currentPage--" style="font-size:11px; padding:2px 8px"><i class="bi bi-chevron-left"></i></button>
            <span style="padding:4px 8px">{{ currentPage }} / {{ totalPages }}</span>
            <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage >= totalPages" @click="currentPage++" style="font-size:11px; padding:2px 8px"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th v-if="colVisible('name')">案件名</th>
                <th v-if="colVisible('business_type')">事業区分</th>
                <th v-if="colVisible('company')">企業名</th>
                <th v-if="colVisible('status')">ステータス</th>
                <th v-if="colVisible('assigned')">担当</th>
                <th v-if="colVisible('win_rate') && showDslColumns">受注確度</th>
                <th v-if="colVisible('revenue') && showDslColumns">提案金額</th>
                <th v-if="colVisible('is_active')">継続</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedProjects.length === 0">
                <td :colspan="visibleColumns.length" class="empty-state">案件がありません</td>
              </tr>
              <tr v-for="p in paginatedProjects" :key="p.id">
                <td v-if="colVisible('name')">
                  <a href="#" @click.prevent="goDetail(p.id)">{{ p.name }}</a>
                </td>
                <td v-if="colVisible('business_type')">
                  <span :class="'badge-biz badge-' + p.business_type">{{ p.business_type }}</span>
                </td>
                <td v-if="colVisible('company')">
                  <a href="#" @click.prevent="goCompany(p.company_id)">{{ p.company_name }}</a>
                </td>
                <td v-if="colVisible('status')">
                  <span :class="'badge-status badge-' + p.status">{{ p.status }}</span>
                </td>
                <td v-if="colVisible('assigned')">{{ p.assigned_member_name }}</td>
                <td v-if="colVisible('win_rate') && showDslColumns">
                  <span v-if="p.business_type === 'DSL' && p.win_rate != null">{{ p.win_rate }}%</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td v-if="colVisible('revenue') && showDslColumns">
                  <span v-if="p.business_type === 'DSL' && p.estimated_revenue">{{ formatCurrency(p.estimated_revenue) }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td v-if="colVisible('is_active')">
                  <span v-if="p.is_active" class="text-success"><i class="bi bi-check-circle-fill"></i></span>
                  <span v-else class="text-muted"><i class="bi bi-dash-circle"></i></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      projects: [],
      companies: [],
      departments: [],
      contractLinesAll: [],
      loading: true,
      showModal: false,
      viewMode: 'list',
      businessTypes: CONSTANTS.BUSINESS_TYPES,
      dslStatuses: CONSTANTS.PROJECT_STATUSES.DSL,
      currentPage: 1,
      perPage: 50,
      filters: {
        business_type: '',
        assigned_member_id: '',
        status: '',
        is_active: 'true',
        winRateMin: '',
      },
      allColumns: [
        { key: 'name', label: '案件名', required: true },
        { key: 'business_type', label: '事業区分' },
        { key: 'company', label: '企業名' },
        { key: 'status', label: 'ステータス' },
        { key: 'assigned', label: '担当' },
        { key: 'win_rate', label: '受注確度' },
        { key: 'revenue', label: '提案金額' },
        { key: 'is_active', label: '継続' },
      ],
      visibleColumns: [],
    };
  },
  computed: {
    availableStatuses() {
      if (this.filters.business_type && CONSTANTS.PROJECT_STATUSES[this.filters.business_type]) {
        return CONSTANTS.PROJECT_STATUSES[this.filters.business_type];
      }
      return [...new Set(Object.values(CONSTANTS.PROJECT_STATUSES).flat())];
    },
    showDslColumns() {
      return !this.filters.business_type || this.filters.business_type === 'DSL';
    },
    filteredProjects() {
      let result = [...this.projects];

      if (this.filters.business_type) {
        result = result.filter(p => p.business_type === this.filters.business_type);
      }
      if (this.filters.assigned_member_id) {
        result = result.filter(p => p.assigned_member_id === this.filters.assigned_member_id);
      }
      if (this.filters.status) {
        result = result.filter(p => p.status === this.filters.status);
      }
      if (this.filters.is_active === 'true') {
        result = result.filter(p => p.is_active);
      }
      // 受注確度フィルタ（DSLのみ）
      if (this.filters.winRateMin) {
        const min = parseInt(this.filters.winRateMin);
        result = result.filter(p => {
          if (p.business_type !== 'DSL') return true;
          return p.win_rate != null && p.win_rate >= min;
        });
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredProjects.length / this.perPage) || 1;
    },
    pageStart() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    pageEnd() {
      return Math.min(this.currentPage * this.perPage, this.filteredProjects.length);
    },
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredProjects.slice(start, start + this.perPage);
    },
    kanbanData() {
      const data = {};
      this.dslStatuses.forEach(s => { data[s] = []; });
      this.filteredProjects.forEach(p => {
        if (p.business_type === 'DSL' && data[p.status]) {
          data[p.status].push(p);
        }
      });
      return data;
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
      const [projects, companies, departments, contractLines] = await Promise.all([
        API.getProjectList(),
        API.getCompanyList(),
        API.getAllDepartments(),
        API.getAllContractLines(),
      ]);
      this.projects = projects;
      this.companies = companies;
      this.departments = departments;
      this.contractLinesAll = contractLines;
      this.loading = false;
    },
    async onSaved() {
      this.showModal = false;
      await this.loadData();
    },
    formatCurrency(amount) {
      return FilterUtils.formatCurrency(amount);
    },
    goDetail(id) {
      window.location.hash = '#/projects/' + id;
    },
    goCompany(id) {
      window.location.hash = '#/companies/' + id;
    },
    exportCsv() {
      const headers = ['案件名', '事業区分', '企業名', 'ステータス', '担当', '受注確度', '提案金額', '継続'];
      const rows = this.filteredProjects.map(p => [
        p.name, p.business_type, p.company_name, p.status, p.assigned_member_name,
        p.win_rate != null ? p.win_rate + '%' : '', p.estimated_revenue || '',
        p.is_active ? '継続中' : '停止',
      ]);
      CsvUtils.download('projects', headers, rows);
    },
  },
  watch: {
    'filters.business_type'(val) {
      if (val !== 'DSL') this.viewMode = 'list';
      this.currentPage = 1;
    },
    'filters.assigned_member_id'() { this.currentPage = 1; },
    'filters.status'() { this.currentPage = 1; },
    'filters.is_active'() { this.currentPage = 1; },
    'filters.winRateMin'() { this.currentPage = 1; },
  },
  async mounted() {
    await this.loadData();
  },
};
