/**
 * SFA02 - 企業詳細ページ（A）プレースホルダー
 * Phase 2で完全実装
 */

const CompanyDetail = {
  template: `
    <div>
      <div class="page-header">
        <h2>
          <a href="#/companies" class="text-muted" style="text-decoration:none; font-size:14px">
            <i class="bi bi-arrow-left"></i> 企業一覧
          </a>
        </h2>
      </div>

      <div v-if="company" class="card mb-3">
        <div class="card-body">
          <h3 class="mb-2">{{ company.name }}</h3>
          <div class="row">
            <div class="col-md-6">
              <p><strong>業種:</strong> {{ company.industry || '-' }}</p>
              <p><strong>電話:</strong> {{ company.phone || '-' }}</p>
              <p><strong>住所:</strong> {{ company.address || '-' }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>リード獲得元:</strong> {{ company.lead_source || '-' }}</p>
              <p><strong>Webサイト:</strong>
                <span v-if="company.website_url">{{ company.website_url }}</span>
                <span v-else>-</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="company" class="card">
        <div class="card-body">
          <p class="text-muted text-center" style="padding: 40px;">
            <i class="bi bi-tools"></i> 企業詳細タブ（契約・部署・商談・案件・求人・タスク）はPhase 2で実装予定
          </p>
        </div>
      </div>

      <div v-if="!company && !loading" class="empty-state">
        企業が見つかりません
      </div>
    </div>
  `,
  props: ['companyId'],
  data() {
    return {
      company: null,
      loading: true,
    };
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.company = await API.getCompanyById(this.companyId);
      this.loading = false;
    },
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    companyId() {
      this.loadData();
    },
  },
};
