/**
 * SFA02 - 求人一覧（B-5）
 * 求人取得状況とSENT状況を把握する
 */

const JobList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-person-badge"></i> 求人一覧</h2>
        <div class="d-flex gap-2 align-items-center">
          <filter-save screen-key="jobs" :current-filters="filters" @apply="applyFilter"></filter-save>
          <column-toggle screen-key="jobs" :all-columns="allColumns" @update="onColumnsUpdate"></column-toggle>
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
            <i class="bi bi-download"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="showModal = true">
            <i class="bi bi-plus-lg"></i> 求人追加
          </button>
        </div>
      </div>

      <job-modal :show="showModal" :members="members" :companies="companies" :contacts="contacts" :projects="projects" :departments="departments" @close="showModal = false" @saved="onSaved"></job-modal>

      <!-- フィルター -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>取得担当者</label>
          <select v-model="filters.member">
            <option value="">全員</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>事業区分</label>
          <select v-model="filters.business_type">
            <option value="">すべて</option>
            <option v-for="bt in jobBusinessTypes" :key="bt" :value="bt">{{ bt }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>期間</label>
          <select v-model="filters.dateRange">
            <option value="">すべて</option>
            <option value="thisMonth">今月</option>
            <option value="lastMonth">先月</option>
            <option value="quarter">四半期</option>
          </select>
        </div>
        <div class="filter-group">
          <label>関連案件</label>
          <select v-model="filters.hasProject">
            <option value="">すべて</option>
            <option value="true">あり</option>
            <option value="false">なし</option>
          </select>
        </div>
      </div>

      <!-- ページネーション -->
      <div class="d-flex justify-content-between align-items-center mb-2" v-if="totalPages > 1" style="font-size:12px; color:var(--color-text-muted)">
        <span>{{ filteredJobs.length }}件中 {{ pageStart }}-{{ pageEnd }}件を表示</span>
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
              <th v-if="colVisible('job_title')">求人タイトル</th>
              <th v-if="colVisible('company')">企業名</th>
              <th v-if="colVisible('department')">担当部署</th>
              <th v-if="colVisible('business_type')">事業区分</th>
              <th v-if="colVisible('acquired_date')">取得日</th>
              <th v-if="colVisible('members')">取得担当者</th>
              <th v-if="colVisible('project')">関連案件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedJobs.length === 0">
              <td :colspan="visibleColumns.length" class="empty-state">求人がありません</td>
            </tr>
            <tr v-for="j in paginatedJobs" :key="j.id">
              <td v-if="colVisible('job_title')">{{ j.job_title }}</td>
              <td v-if="colVisible('company')">
                <a href="#" @click.prevent="goCompany(j.company_id)">{{ j.company_name }}</a>
              </td>
              <td v-if="colVisible('department')">{{ j.department_name }}</td>
              <td v-if="colVisible('business_type')">
                <span :class="'badge-biz badge-' + j.business_type">{{ j.business_type }}</span>
              </td>
              <td v-if="colVisible('acquired_date')">{{ formatDate(j.acquired_date) }}</td>
              <td v-if="colVisible('members')">
                <span v-for="(name, i) in j.member_names" :key="i">
                  {{ name }}<span v-if="i < j.member_names.length - 1">, </span>
                </span>
              </td>
              <td v-if="colVisible('project')">{{ j.project_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      jobs: [],
      companies: [],
      contacts: [],
      projects: [],
      departments: [],
      loading: true,
      showModal: false,
      jobBusinessTypes: CONSTANTS.JOB_BUSINESS_TYPES,
      currentPage: 1,
      perPage: 50,
      filters: {
        member: '',
        business_type: '',
        dateRange: '',
        hasProject: '',
      },
      allColumns: [
        { key: 'job_title', label: '求人タイトル', required: true },
        { key: 'company', label: '企業名' },
        { key: 'department', label: '担当部署' },
        { key: 'business_type', label: '事業区分' },
        { key: 'acquired_date', label: '取得日' },
        { key: 'members', label: '取得担当者' },
        { key: 'project', label: '関連案件' },
      ],
      visibleColumns: [],
    };
  },
  computed: {
    filteredJobs() {
      let result = [...this.jobs];

      if (this.filters.member) {
        result = result.filter(j => j.member_names && j.member_names.some(name => {
          const member = this.members.find(m => m.id === this.filters.member);
          return member && name === member.name;
        }));
      }
      if (this.filters.business_type) {
        result = result.filter(j => j.business_type === this.filters.business_type);
      }
      if (this.filters.dateRange) {
        result = result.filter(j => FilterUtils.matchDateRange(j, this.filters.dateRange));
      }
      if (this.filters.hasProject === 'true') {
        result = result.filter(j => j.project_name && j.project_name !== '-');
      } else if (this.filters.hasProject === 'false') {
        result = result.filter(j => !j.project_name || j.project_name === '-');
      }

      // 取得日降順
      result.sort((a, b) => new Date(b.acquired_date) - new Date(a.acquired_date));
      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredJobs.length / this.perPage) || 1;
    },
    pageStart() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    pageEnd() {
      return Math.min(this.currentPage * this.perPage, this.filteredJobs.length);
    },
    paginatedJobs() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredJobs.slice(start, start + this.perPage);
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
      const [jobs, companies, contacts, projects, departments] = await Promise.all([
        API.getJobList(),
        API.getCompanyList(),
        API.getAllContacts(),
        API.getProjectList(),
        API.getAllDepartments(),
      ]);
      this.jobs = jobs;
      this.companies = companies;
      this.contacts = contacts;
      this.projects = projects;
      this.departments = departments;
      this.loading = false;
    },
    async onSaved() {
      this.showModal = false;
      await this.loadData();
    },
    formatDate(d) {
      return FilterUtils.formatDate(d);
    },
    goCompany(id) {
      window.location.hash = '#/companies/' + id;
    },
    exportCsv() {
      const headers = ['求人タイトル', '企業名', '担当部署', '事業区分', '取得日', '取得担当者', '関連案件'];
      const rows = this.filteredJobs.map(j => [
        j.job_title, j.company_name, j.department_name, j.business_type,
        j.acquired_date || '', (j.member_names || []).join(', '), j.project_name || '',
      ]);
      CsvUtils.download('jobs', headers, rows);
    },
  },
  watch: {
    'filters.member'() { this.currentPage = 1; },
    'filters.business_type'() { this.currentPage = 1; },
    'filters.dateRange'() { this.currentPage = 1; },
    'filters.hasProject'() { this.currentPage = 1; },
  },
  async mounted() {
    await this.loadData();
  },
};
