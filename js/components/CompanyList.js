/**
 * SFA02 - 企業一覧（B-2）
 * 担当企業の状況を横断的に把握する
 */

const CompanyList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-building"></i> 企業一覧</h2>
        <button class="btn btn-primary btn-sm" @click="showModal = true">
          <i class="bi bi-plus-lg"></i> 企業追加
        </button>
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
      </div>

      <!-- テーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>企業名</th>
              <th>業種</th>
              <th>担当メンバー</th>
              <th>ITSS</th>
              <th>PERM</th>
              <th>DSL</th>
              <th>最終商談日</th>
              <th>リード獲得元</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCompanies.length === 0">
              <td colspan="8" class="empty-state">企業がありません</td>
            </tr>
            <tr v-for="c in filteredCompanies" :key="c.id">
              <td>
                <a href="#" @click.prevent="goDetail(c.id)">{{ c.name }}</a>
              </td>
              <td>{{ c.industry || '-' }}</td>
              <td>
                <span v-for="(m, i) in c.members" :key="i">
                  {{ m }}<span v-if="i < c.members.length - 1">, </span>
                </span>
                <span v-if="!c.members.length" class="text-muted">-</span>
              </td>
              <td>
                <span v-if="c.contract_statuses.ITSS !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.ITSS">
                  {{ c.contract_statuses.ITSS }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="c.contract_statuses.PERM !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.PERM">
                  {{ c.contract_statuses.PERM }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="c.contract_statuses.DSL !== '-'"
                      :class="'badge-status badge-' + c.contract_statuses.DSL">
                  {{ c.contract_statuses.DSL }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ formatDate(c.last_meeting_date) }}</td>
              <td>{{ c.lead_source || '-' }}</td>
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
      loading: true,
      showModal: false,
      industries: CONSTANTS.INDUSTRIES,
      contractStatuses: CONSTANTS.CONTRACT_STATUSES,
      leadSources: CONSTANTS.LEAD_SOURCES,
      filters: {
        member: '',
        industry: '',
        contractStatus: '',
        leadSource: '',
      },
    };
  },
  computed: {
    filteredCompanies() {
      let result = [...this.companies];

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
      if (this.filters.contractStatus) {
        result = result.filter(c =>
          Object.values(c.contract_statuses).includes(this.filters.contractStatus)
        );
      }
      if (this.filters.leadSource) {
        result = result.filter(c => c.lead_source === this.filters.leadSource);
      }

      return result;
    },
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.companies = await API.getCompanyList();
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
  },
  async mounted() {
    await this.loadData();
  },
};
