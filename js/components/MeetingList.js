/**
 * SFA02 - 商談一覧（B-3）
 * 商談活動の進捗と取得状況を把握する
 */

const MeetingList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-calendar-event"></i> 商談一覧</h2>
        <div class="d-flex gap-2 align-items-center">
          <filter-save screen-key="meetings" :current-filters="filters" @apply="applyFilter"></filter-save>
          <column-toggle screen-key="meetings" :all-columns="allColumns" @update="onColumnsUpdate"></column-toggle>
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
            <i class="bi bi-download"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="showModal = true">
            <i class="bi bi-plus-lg"></i> 商談追加
          </button>
        </div>
      </div>

      <meeting-modal :show="showModal" :members="members" :companies="companies" :contacts="contacts" :projects="projects" @close="showModal = false" @saved="onSaved"></meeting-modal>

      <!-- フィルター -->
      <div class="filter-bar">
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
          <label>商談取得者</label>
          <select v-model="filters.setter_member_id">
            <option value="">全員</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>有効/無効</label>
          <select v-model="filters.validOnly">
            <option value="true">有効のみ</option>
            <option value="">すべて</option>
          </select>
        </div>
        <div class="filter-group">
          <label>商談形式</label>
          <select v-model="filters.meeting_type">
            <option value="">すべて</option>
            <option v-for="t in meetingTypes" :key="t" :value="t">{{ t }}</option>
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
        <span>{{ filteredMeetings.length }}件中 {{ pageStart }}-{{ pageEnd }}件を表示</span>
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
              <th v-if="colVisible('meeting_date')">商談日</th>
              <th v-if="colVisible('company')">企業名</th>
              <th v-if="colVisible('meeting_type')">形式</th>
              <th v-if="colVisible('setter')">取得者</th>
              <th v-if="colVisible('members')">参加メンバー</th>
              <th v-if="colVisible('contacts')">先方参加者</th>
              <th v-if="colVisible('project')">関連案件</th>
              <th v-if="colVisible('valid')">有効/無効</th>
              <th v-if="colVisible('count')">回数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedMeetings.length === 0">
              <td :colspan="visibleColumns.length" class="empty-state">商談がありません</td>
            </tr>
            <tr v-for="m in paginatedMeetings" :key="m.id">
              <td v-if="colVisible('meeting_date')">{{ formatDate(m.meeting_date) }}</td>
              <td v-if="colVisible('company')">
                <a href="#" @click.prevent="goCompany(m.company_id)">{{ m.company_name }}</a>
              </td>
              <td v-if="colVisible('meeting_type')">{{ m.meeting_type }}</td>
              <td v-if="colVisible('setter')">{{ m.setter_name }}</td>
              <td v-if="colVisible('members')">
                <span v-for="(name, i) in m.member_names" :key="i">
                  {{ name }}<span v-if="i < m.member_names.length - 1">, </span>
                </span>
              </td>
              <td v-if="colVisible('contacts')">
                <span v-for="(name, i) in m.contact_names" :key="i">
                  {{ name }}<span v-if="i < m.contact_names.length - 1">, </span>
                </span>
                <span v-if="!m.contact_names.length" class="text-muted">-</span>
              </td>
              <td v-if="colVisible('project')">{{ m.project_name }}</td>
              <td v-if="colVisible('valid')">
                <span :class="m.is_valid ? 'badge-status badge-valid' : 'badge-status badge-invalid'">
                  {{ m.is_valid ? '有効' : '無効' }}
                </span>
              </td>
              <td v-if="colVisible('count')">{{ m.meeting_count }}回目</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      meetings: [],
      companies: [],
      contacts: [],
      projects: [],
      loading: true,
      showModal: false,
      meetingTypes: CONSTANTS.MEETING_TYPES,
      currentPage: 1,
      perPage: 50,
      filters: {
        dateRange: 'thisMonth',
        setter_member_id: '',
        validOnly: 'true',
        meeting_type: '',
        hasProject: '',
      },
      allColumns: [
        { key: 'meeting_date', label: '商談日', required: true },
        { key: 'company', label: '企業名' },
        { key: 'meeting_type', label: '形式' },
        { key: 'setter', label: '取得者' },
        { key: 'members', label: '参加メンバー' },
        { key: 'contacts', label: '先方参加者' },
        { key: 'project', label: '関連案件' },
        { key: 'valid', label: '有効/無効' },
        { key: 'count', label: '回数' },
      ],
      visibleColumns: [],
    };
  },
  computed: {
    filteredMeetings() {
      let result = [...this.meetings];

      if (this.filters.dateRange) {
        result = result.filter(m => FilterUtils.matchDateRange(m, this.filters.dateRange));
      }
      if (this.filters.setter_member_id) {
        result = result.filter(m => m.setter_member_id === this.filters.setter_member_id);
      }
      if (this.filters.validOnly === 'true') {
        result = result.filter(m => m.is_valid);
      }
      if (this.filters.meeting_type) {
        result = result.filter(m => m.meeting_type === this.filters.meeting_type);
      }
      // 関連案件あり/なし
      if (this.filters.hasProject === 'true') {
        result = result.filter(m => m.project_name && m.project_name !== '-');
      } else if (this.filters.hasProject === 'false') {
        result = result.filter(m => !m.project_name || m.project_name === '-');
      }

      // 日付降順
      result.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredMeetings.length / this.perPage) || 1;
    },
    pageStart() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    pageEnd() {
      return Math.min(this.currentPage * this.perPage, this.filteredMeetings.length);
    },
    paginatedMeetings() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredMeetings.slice(start, start + this.perPage);
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
      const [meetings, companies, contacts, projects] = await Promise.all([
        API.getMeetingList(),
        API.getCompanyList(),
        API.getAllContacts(),
        API.getProjectList(),
      ]);
      this.meetings = meetings;
      this.companies = companies;
      this.contacts = contacts;
      this.projects = projects;
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
      const headers = ['商談日', '企業名', '形式', '取得者', '参加メンバー', '先方参加者', '関連案件', '有効/無効', '回数'];
      const rows = this.filteredMeetings.map(m => [
        m.meeting_date || '', m.company_name, m.meeting_type, m.setter_name,
        (m.member_names || []).join(', '), (m.contact_names || []).join(', '),
        m.project_name || '-', m.is_valid ? '有効' : '無効', m.meeting_count + '回目',
      ]);
      CsvUtils.download('meetings', headers, rows);
    },
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    'filters.dateRange'() { this.currentPage = 1; },
    'filters.setter_member_id'() { this.currentPage = 1; },
    'filters.validOnly'() { this.currentPage = 1; },
    'filters.meeting_type'() { this.currentPage = 1; },
    'filters.hasProject'() { this.currentPage = 1; },
  },
};
