/**
 * 部署登録モーダル
 */
const DepartmentModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">部署追加</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">企業</label>
              <input type="text" class="form-control" :value="companyName" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">部署名</label>
              <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': errors.name}">
              <div class="invalid-feedback">{{ errors.name }}</div>
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
  props: ['show', 'companyId', 'companyName'],
  emits: ['close', 'saved'],
  data() {
    return { form: { name: '' }, errors: {}, saving: false };
  },
  methods: {
    validate() {
      this.errors = {};
      if (!this.form.name.trim()) this.errors.name = '部署名は必須です';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      await API.createDepartment({ company_id: this.companyId, name: this.form.name });
      this.saving = false;
      this.$emit('saved');
      this.close();
    },
    close() { this.$emit('close'); },
  },
  watch: {
    show(v) { if (v) { this.form = { name: '' }; this.errors = {}; } },
  },
};
