/**
 * SFA02 - 企業一覧（B-2）
 * 担当企業の状況を横断的に把握する
 */

const CompanyList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-building"></i> 企業一覧</h2>
        <div class="d-flex gap-2 align-items-center">
          <filter-save screen-key="companies" :current-filters="filters" @apply="applyFilter"></filter-save>
          <column-toggle screen-key="companies" :all-columns="allColumns" @update="onColumnsUpdate"></column-toggle>
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
            <i class="bi bi-download"></i> CSV
          </button>
          <button class="btn btn-primary btn-sm" @click="showModal = true">
            <i class="bi bi-plus-lg"></i> 企業追加
          </button>
        </div>
      </div>

      <company-modal :show="showModal" :members="members" @close="showModal = false" @saved="onSaved"></company-modal>

      <!-- フィルター -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>担当メンバー</label>
          <select v-model="filters.member">
            <option value="">全員</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>業種</label>
          <select v-model="filters.industry">
            <option value="">すべて</option>
            <option v-for="ind in industries" :key="ind" :value="ind">{{ ind }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tier</label>
          <select v-model="filters.tier">
            <option value="">すべて</option>
            <option v-for="t in tiers" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>契約ステータス</label>
          <select v-model="filters.contractStatus">
            <option value="">すべて</option>
            <option v-for="s in contractStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>リード獲得元</label>
          <select v-model="filters.leadSource">
            <option value="">すべて</option>
            <option v-for="ls in leadSources" :key="ls" :value="ls">{{ ls }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>最終商談日</label>
          <select v-model="filters.lastMeetingRange">
            <option value="">すべて</option>
            <option value="30">30日以内</option>
            <option value="90over">90日以上未接触</option>
          </select>
        </div>
      </div>

      <!-- ページネーション -->
      <div class="d-flex justify-content-between align-items-center mb-2" v-if="totalPages > 1" style="font-size:12px; color:var(--color-text-muted)">
        <span>{{ filteredCompanies.length }}件中 {{ pageStart }}-{{ pageEnd }}件を表示</span>
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
              <th v-if="colVisible('name')">企業名</th>
              <th v-if="colVisible('tier')">Tier</th>
              <th v-if="colVisible('industry')">業種</th>
              <th v-if="colVisible('members')">担当メンバー</th>
              <th v-if="colVisible('itss')">ITSS</th>
              <th v-if="colVisible('perm')">PERM</th>
              <th v-if="colVisible('dsl')">DSL</th>
              <th v-if="colVisible('last_meeting')">最終商談日</th>
              <th v-if="colVisible('sent_count')">Sent数(90日)</th>
              <th v-if="colVisible('lead_source')">リード獲得元</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedCompanies.length === 0">
              <td :colspan="visibleColumns.length" class="empty-state">企業がありません</td>
            </tr>
            <tr v-for="c in paginatedCompanies" :key="c.id">
              <td v-if="colVisible('name')">
                <a href="#" @click.prevent="goDetail(c.id)">{{ c.name }}</a>
              </td>
              <td v-if="colVisible('tier')">
                <span v-if="c.tier" :class="'badge-tier tier-' + c.tier">{{ c.tier }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('industry')">{{ c.industry || '-' }}</td>
              <td v-if="colVisible('members')">
                <span v-for="(m, i) in c.members" :key="i">
                  {{ m }}<span v-if="i < c.members.length - 1">, </span>
                </span>
                <span v-if="!c.members.length" class="text-muted">-</span>
              </td>
              <td v-if="colVisible('itss')">
                <span v-if="c.contract_statuses.ITSS !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.ITSS">
                  {{ c.contract_statuses.ITSS }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('perm')">
                <span v-if="c.contract_statuses.PERM !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.PERM">
                  {{ c.contract_statuses.PERM }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('dsl')">
                <span v-if="c.contract_statuses.DSL !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.DSL">
                  {{ c.contract_statuses.DSL }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('last_meeting')">{{ formatDate(c.last_meeting_date) }}</td>
              <td v-if="colVisible('sent_count')">
                <span v-if="c.sent_count_90d != null">{{ c.sent_count_90d }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td v-if="colVisible('lead_source')">{{ c.lead_source || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      companies: [],
      deptSentCounts: [],
      loading: true,
      showModal: false,
      industries: CONSTANTS.INDUSTRIES,
      contractStatuses: CONSTANTS.CONTRACT_STATUSES,
      leadSources: CONSTANTS.LEAD_SOURCES,
      tiers: ['A', 'B', 'C', 'D'],
      currentPage: 1,
      perPage: 50,
      filters: {
        member: '',
        industry: '',
        tier: '',
        contractStatus: '',
        leadSource: '',
        lastMeetingRange: '',
      },
      allColumns: [
        { key: 'name', label: '企業名', required: true },
        { key: 'tier', label: 'Tier' },
        { key: 'industry', label: '業種' },
        { key: 'members', label: '担当メンバー' },
        { key: 'itss', label: 'ITSS' },
        { key: 'perm', label: 'PERM' },
        { key: 'dsl', label: 'DSL' },
        { key: 'last_meeting', label: '最終商談日' },
        { key: 'sent_count', label: 'Sent数(90日)' },
        { key: 'lead_source', label: 'リード獲得元' },
      ],
      visibleColumns: [],
    };
  },
  computed: {
    filteredCompanies() {
      let result = [...this.companies];

      // 企業ごとのSent数を集計して付与
      result = result.map(c => {
        const depts = this.deptSentCounts.filter(d => d.company_id === c.id);
        const sentTotal = depts.reduce((sum, d) => sum + (d.sent_count_90d || 0), 0);
        return { ...c, sent_count_90d: sentTotal > 0 ? sentTotal : null };
      });

      if (this.filters.member) {
        result = result.filter(c =>
          c.members && c.members.some(m => {
            const member = this.members.find(x => x.id === this.filters.member);
            return member && m === member.name;
          })
        );
      }
      if (this.filters.industry) {
        result = result.filter(c => c.industry === this.filters.industry);
      }
      if (this.filters.tier) {
        result = result.filter(c => c.tier === this.filters.tier);
      }
      if (this.filters.contractStatus) {
        result = result.filter(c =>
          Object.values(c.contract_statuses).includes(this.filters.contractStatus)
        );
      }
      if (this.filters.leadSource) {
        result = result.filter(c => c.lead_source === this.filters.leadSource);
      }
      if (this.filters.lastMeetingRange === '30') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        result = result.filter(c => c.last_meeting_date && new Date(c.last_meeting_date) >= cutoff);
      } else if (this.filters.lastMeetingRange === '90over') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        result = result.filter(c => !c.last_meeting_date || new Date(c.last_meeting_date) < cutoff);
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredCompanies.length / this.perPage) || 1;
    },
    pageStart() {
      return (this.currentPage - 1) * this.perPage + 1;
    },
    pageEnd() {
      return Math.min(this.currentPage * this.perPage, this.filteredCompanies.length);
    },
    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredCompanies.slice(start, start + this.perPage);
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
      const [companies, deptSentCounts] = await Promise.all([
        API.getCompanyList(),
        API.getDeptSentCounts(),
      ]);
      this.companies = companies;
      this.deptSentCounts = deptSentCounts;
      this.loading = false;
    },
    formatDate(d) {
      return FilterUtils.formatDate(d);
    },
    goDetail(id) {
      window.location.hash = '#/companies/' + id;
    },
    async onSaved() {
      this.showModal = false;
      await this.loadData();
    },
    exportCsv() {
      const headers = ['企業名', 'Tier', '業種', '担当メンバー', 'ITSS', 'PERM', 'DSL', '最終商談日', 'Sent数(90日)', 'リード獲得元'];
      const rows = this.filteredCompanies.map(c => [
        c.name, c.tier || '', c.industry || '', (c.members || []).join(', '),
        c.contract_statuses.ITSS, c.contract_statuses.PERM, c.contract_statuses.DSL,
        c.last_meeting_date || '', c.sent_count_90d || '', c.lead_source || '',
      ]);
      CsvUtils.download('companies', headers, rows);
    },
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    'filters.member'() { this.currentPage = 1; },
    'filters.industry'() { this.currentPage = 1; },
    'filters.tier'() { this.currentPage = 1; },
    'filters.contractStatus'() { this.currentPage = 1; },
    'filters.leadSource'() { this.currentPage = 1; },
    'filters.lastMeetingRange'() { this.currentPage = 1; },
  },
};
