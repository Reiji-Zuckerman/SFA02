/**
 * SFA02 - 求人一覧（B-5）
 * 求人取得状況とSENT状況を把握する
 */

const JobList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-person-badge"></i> 求人一覧</h2>
        <button class="btn btn-primary btn-sm" @click="showModal = true">
          <i class="bi bi-plus-lg"></i> 求人追加
        </button>
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

      <!-- テーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>求人タイトル</th>
              <th>企業名</th>
              <th>担当部署</th>
              <th>事業区分</th>
              <th>取得日</th>
              <th>取得担当者</th>
              <th>関連案件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredJobs.length === 0">
              <td colspan="7" class="empty-state">求人がありません</td>
            </tr>
            <tr v-for="j in filteredJobs" :key="j.id">
              <td>{{ j.job_title }}</td>
              <td>
                <a href="#" @click.prevent="goCompany(j.company_id)">{{ j.company_name }}</a>
              </td>
              <td>{{ j.department_name }}</td>
              <td>
                <span :class="'badge-biz badge-' + j.business_type">{{ j.business_type }}</span>
              </td>
              <td>{{ formatDate(j.acquired_date) }}</td>
              <td>
                <span v-for="(name, i) in j.member_names" :key="i">
                  {{ name }}<span v-if="i < j.member_names.length - 1">, </span>
                </span>
              </td>
              <td>{{ j.project_name }}</td>
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
      filters: {
        member: '',
        business_type: '',
        dateRange: '',
        hasProject: '',
      },
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
  },
  methods: {
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
  },
  async mounted() {
    await this.loadData();
  },
};
