/**
 * 契約登録・編集モーダル
 */
const ContractLineModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? '契約編集' : '契約追加' }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">企業</label>
              <input type="text" class="form-control" :value="companyName" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">事業区分</label>
              <select v-model="form.business_type" class="form-select" :class="{'is-invalid': errors.business_type}">
                <option value="">選択してください</option>
                <option v-for="bt in businessTypes" :key="bt" :value="bt">{{ bt }}</option>
              </select>
              <div class="invalid-feedback">{{ errors.business_type }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">ステータス</label>
              <select v-model="form.status" class="form-select" :class="{'is-invalid': errors.status}">
                <option value="">選択してください</option>
                <option v-for="s in contractStatuses" :key="s" :value="s">{{ s }}</option>
              </select>
              <div class="invalid-feedback">{{ errors.status }}</div>
            </div>
            <!-- 締結日（ステータス=締結済 のみ） -->
            <div class="mb-3" v-if="form.status === '締結済'">
              <label class="form-label">締結日</label>
              <input v-model="form.contracted_date" type="date" class="form-control">
            </div>
            <!-- 失注・リサイクル理由（ステータス=リサイクル のみ） -->
            <div class="mb-3" v-if="form.status === 'リサイクル'">
              <label class="form-label">失注・リサイクル理由</label>
              <select v-model="form.lost_reason" class="form-select">
                <option value="">選択してください</option>
                <option v-for="r in lostReasons" :key="r" :value="r">{{ r }}</option>
              </select>
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
  props: ['show', 'editData', 'companyId', 'companyName'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      businessTypes: CONSTANTS.BUSINESS_TYPES,
      contractStatuses: CONSTANTS.CONTRACT_STATUSES,
      lostReasons: CONSTANTS.LOST_REASONS,
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
  },
  methods: {
    getEmptyForm() {
      return { business_type: '', status: '', contracted_date: '', lost_reason: '' };
    },
    validate() {
      this.errors = {};
      if (!this.form.business_type) this.errors.business_type = '事業区分は必須です';
      if (!this.form.status) this.errors.status = 'ステータスは必須です';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form, company_id: this.companyId };
      if (this.isEdit) {
        await API.updateContractLine(this.editData.id, data);
      } else {
        await API.createContractLine(data);
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
          this.form = this.getEmptyForm();
        }
      }
    },
  },
};
