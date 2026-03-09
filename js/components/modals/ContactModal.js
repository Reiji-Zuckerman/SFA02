/**
 * 担当者登録・編集モーダル
 */
const ContactModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? '担当者編集' : '担当者追加' }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">企業</label>
              <input type="text" class="form-control" :value="companyName" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label required-label">氏名</label>
              <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': errors.name}">
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">氏名カナ</label>
              <input v-model="form.name_kana" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">所属部署</label>
              <div class="d-flex gap-2">
                <select v-model="form.department_id" class="form-select" style="flex:1">
                  <option value="">選択してください</option>
                  <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showNewDept = true" v-if="!showNewDept">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <div v-if="showNewDept" class="mt-2 d-flex gap-2">
                <input v-model="newDeptName" type="text" class="form-control form-control-sm" placeholder="新規部署名">
                <button type="button" class="btn btn-primary btn-sm" @click="createDept">追加</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="showNewDept = false; newDeptName = ''">取消</button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">役職</label>
              <input v-model="form.title" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">影響度</label>
              <select v-model="form.influence_type" class="form-select">
                <option value="">選択してください</option>
                <option v-for="it in influenceTypes" :key="it" :value="it">{{ it }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">メールアドレス</label>
              <input v-model="form.email" type="email" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">直通電話</label>
              <input v-model="form.phone" type="tel" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label required-label">在籍</label>
              <div class="form-check form-switch">
                <input v-model="form.is_active" class="form-check-input" type="checkbox" role="switch">
                <label class="form-check-label">{{ form.is_active ? '在籍中' : '退職・異動' }}</label>
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
  props: ['show', 'editData', 'companyId', 'companyName', 'departments'],
  emits: ['close', 'saved', 'dept-created'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      showNewDept: false,
      newDeptName: '',
      influenceTypes: CONSTANTS.INFLUENCE_TYPES,
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
  },
  methods: {
    getEmptyForm() {
      return {
        name: '', name_kana: '', department_id: '', title: '',
        influence_type: '', email: '', phone: '', is_active: true,
      };
    },
    validate() {
      this.errors = {};
      if (!this.form.name.trim()) this.errors.name = '氏名は必須です';
      return Object.keys(this.errors).length === 0;
    },
    async createDept() {
      if (!this.newDeptName.trim()) return;
      await API.createDepartment({ company_id: this.companyId, name: this.newDeptName });
      this.$emit('dept-created');
      this.showNewDept = false;
      this.newDeptName = '';
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form, company_id: this.companyId };
      if (this.isEdit) {
        await API.updateContact(this.editData.id, data);
      } else {
        await API.createContact(data);
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
        this.showNewDept = false;
        this.newDeptName = '';
        if (this.editData && this.editData.id) {
          this.form = { ...this.editData };
        } else {
          this.form = this.getEmptyForm();
        }
      }
    },
  },
};
