/**
 * 案件登録・編集モーダル
 * 事業区分によって表示フィールドが動的に変化
 */
const ProjectModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? '案件編集' : '新規案件登録' }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">企業</label>
                <select v-model="form.company_id" class="form-select" :class="{'is-invalid': errors.company_id}" :disabled="!!fixedCompanyId">
                  <option value="">選択してください</option>
                  <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.company_id }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">事業区分</label>
                <select v-model="form.business_type" class="form-select" :class="{'is-invalid': errors.business_type}" @change="onBusinessTypeChange">
                  <option value="">選択してください</option>
                  <option v-for="bt in businessTypes" :key="bt" :value="bt">{{ bt }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.business_type }}</div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">案件名</label>
              <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': errors.name}">
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">担当部署</label>
                <select v-model="form.department_id" class="form-select">
                  <option value="">選択してください</option>
                  <option v-for="d in availableDepts" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">主担当メンバー</label>
                <select v-model="form.assigned_member_id" class="form-select" :class="{'is-invalid': errors.assigned_member_id}">
                  <option value="">選択してください</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.assigned_member_id }}</div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">ステータス</label>
              <select v-model="form.status" class="form-select" :class="{'is-invalid': errors.status}" @change="onStatusChange">
                <option value="">選択してください</option>
                <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
              </select>
              <div class="invalid-feedback">{{ errors.status }}</div>
            </div>

            <!-- DSLのみ表示フィールド -->
            <template v-if="form.business_type === 'DSL'">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">受注確度</label>
                  <div class="d-flex align-items-center gap-2">
                    <input v-model.number="form.win_rate" type="range" class="form-range" min="0" max="100" step="5" style="flex:1">
                    <span class="badge bg-primary" style="min-width:45px">{{ form.win_rate || 0 }}%</span>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">提案金額（円）</label>
                  <input v-model.number="form.estimated_revenue" type="number" class="form-control" min="0" step="10000">
                </div>
              </div>
              <div class="row">
                <!-- 受注金額（ステータス=受注 のみ） -->
                <div class="col-md-6 mb-3" v-if="form.status === '受注'">
                  <label class="form-label">受注金額（円）</label>
                  <input v-model.number="form.contract_revenue" type="number" class="form-control" min="0" step="10000">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">想定粗利（円）</label>
                  <input v-model.number="form.estimated_gross_profit" type="number" class="form-control" min="0" step="10000">
                </div>
              </div>
              <!-- 失注理由（ステータス=失注 のみ） -->
              <div class="mb-3" v-if="form.status === '失注'">
                <label class="form-label">失注理由</label>
                <select v-model="form.lost_reason" class="form-select">
                  <option value="">選択してください</option>
                  <option v-for="r in lostReasons" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">関連契約</label>
                <select v-model="form.contractline_id" class="form-select">
                  <option value="">なし</option>
                  <option v-for="cl in availableContractLines" :key="cl.id" :value="cl.id">
                    {{ cl.business_type }} - {{ cl.status }}
                  </option>
                </select>
              </div>
            </template>

            <div class="mb-3">
              <label class="form-label required-label">継続中</label>
              <div class="form-check form-switch">
                <input v-model="form.is_active" class="form-check-input" type="checkbox" role="switch">
                <label class="form-check-label">{{ form.is_active ? '継続中' : '終了' }}</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">キャンセル</button>
            <button type="button" class="btn btn-primary" @click="save" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['show', 'editData', 'fixedCompanyId', 'members', 'companies', 'departments', 'contractLines'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      businessTypes: CONSTANTS.BUSINESS_TYPES,
      lostReasons: [...CONSTANTS.LOST_REASONS, 'その他'],
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
    statusOptions() {
      if (!this.form.business_type) return [];
      return CONSTANTS.PROJECT_STATUSES[this.form.business_type] || [];
    },
    availableDepts() {
      if (!this.form.company_id || !this.departments) return [];
      return this.departments.filter(d => d.company_id === this.form.company_id);
    },
    availableContractLines() {
      if (!this.form.company_id || !this.contractLines) return [];
      return this.contractLines.filter(cl => cl.business_type === 'DSL');
    },
  },
  methods: {
    getEmptyForm() {
      return {
        company_id: '', business_type: '', name: '', department_id: '',
        assigned_member_id: '', status: '', win_rate: 0, estimated_revenue: null,
        contract_revenue: null, estimated_gross_profit: null, lost_reason: '',
        contractline_id: '', is_active: true,
      };
    },
    onBusinessTypeChange() {
      this.form.status = '';
      this.form.win_rate = 0;
    },
    onStatusChange() {
      if (this.form.business_type === 'DSL') {
        const defaultRate = CONSTANTS.DSL_WIN_RATE_DEFAULTS[this.form.status];
        if (defaultRate != null) this.form.win_rate = defaultRate;
      }
    },
    validate() {
      this.errors = {};
      if (!this.form.company_id) this.errors.company_id = '企業は必須です';
      if (!this.form.business_type) this.errors.business_type = '事業区分は必須です';
      if (!this.form.name.trim()) this.errors.name = '案件名は必須です';
      if (!this.form.assigned_member_id) this.errors.assigned_member_id = '主担当メンバーは必須です';
      if (!this.form.status) this.errors.status = 'ステータスは必須です';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form };
      if (this.isEdit) {
        await API.updateProject(this.editData.id, data);
      } else {
        await API.createProject(data);
      }
      this.saving = false;
      this.$emit('saved');
      this.close();
    },
    close() { this.$emit('close'); },
  },
  watch: {
    show(v) {
      if (v) {
        this.errors = {};
        if (this.editData && this.editData.id) {
          this.form = { ...this.editData };
        } else {
          const f = this.getEmptyForm();
          if (this.fixedCompanyId) f.company_id = this.fixedCompanyId;
          this.form = f;
        }
      }
    },
  },
};
