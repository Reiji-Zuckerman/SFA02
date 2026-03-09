/**
 * 求人登録モーダル
 */
const JobModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新規求人登録</h5>
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
                <label class="form-label">関連案件</label>
                <select v-model="form.project_id" class="form-select" @change="onProjectChange">
                  <option value="">なし</option>
                  <option v-for="p in availableProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">事業区分</label>
                <select v-model="form.business_type" class="form-select" :class="{'is-invalid': errors.business_type}" :disabled="!!autoBusinessType">
                  <option value="">選択してください</option>
                  <option v-for="bt in jobBusinessTypes" :key="bt" :value="bt">{{ bt }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.business_type }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">求人タイトル</label>
                <input v-model="form.job_title" type="text" class="form-control" :class="{'is-invalid': errors.job_title}">
                <div class="invalid-feedback">{{ errors.job_title }}</div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">取得日</label>
                <input v-model="form.acquired_date" type="date" class="form-control" :class="{'is-invalid': errors.acquired_date}">
                <div class="invalid-feedback">{{ errors.acquired_date }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">担当部署</label>
                <select v-model="form.department_id" class="form-select">
                  <option value="">選択してください</option>
                  <option v-for="d in availableDepts" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">取得担当者</label>
                <select v-model="form.member_ids" class="form-select" multiple style="min-height:80px" :class="{'is-invalid': errors.member_ids}">
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.member_ids }}</div>
                <small class="text-muted">Ctrl+クリックで複数選択</small>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">先方担当者</label>
                <select v-model="form.contact_ids" class="form-select" multiple style="min-height:80px">
                  <option v-for="c in availableContacts" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
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
  props: ['show', 'fixedCompanyId', 'fixedProjectId', 'members', 'companies', 'contacts', 'projects', 'departments'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      autoBusinessType: false,
      jobBusinessTypes: CONSTANTS.JOB_BUSINESS_TYPES,
    };
  },
  computed: {
    availableProjects() {
      if (!this.form.company_id || !this.projects) return [];
      return this.projects.filter(p => p.company_id === this.form.company_id);
    },
    availableDepts() {
      if (!this.form.company_id || !this.departments) return [];
      return this.departments.filter(d => d.company_id === this.form.company_id);
    },
    availableContacts() {
      if (!this.form.company_id || !this.contacts) return [];
      return this.contacts.filter(c => c.company_id === this.form.company_id);
    },
  },
  methods: {
    getEmptyForm() {
      return {
        company_id: '', project_id: '', business_type: '', job_title: '',
        acquired_date: new Date().toISOString().split('T')[0],
        department_id: '', member_ids: [], contact_ids: [],
      };
    },
    onProjectChange() {
      if (this.form.project_id && this.projects) {
        const project = this.projects.find(p => p.id === this.form.project_id);
        if (project) {
          this.form.company_id = project.company_id;
          this.form.business_type = project.business_type;
          this.autoBusinessType = true;
        }
      } else {
        this.autoBusinessType = false;
      }
    },
    validate() {
      this.errors = {};
      if (!this.form.company_id) this.errors.company_id = '企業は必須です';
      if (!this.form.business_type) this.errors.business_type = '事業区分は必須です';
      if (!this.form.job_title.trim()) this.errors.job_title = '求人タイトルは必須です';
      if (!this.form.acquired_date) this.errors.acquired_date = '取得日は必須です';
      if (!this.form.member_ids || this.form.member_ids.length === 0) this.errors.member_ids = '取得担当者は必須です';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      await API.createJob({ ...this.form });
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
        this.autoBusinessType = false;
        const f = this.getEmptyForm();
        if (this.fixedCompanyId) f.company_id = this.fixedCompanyId;
        if (this.fixedProjectId && this.projects) {
          f.project_id = this.fixedProjectId;
          const project = this.projects.find(p => p.id === this.fixedProjectId);
          if (project) {
            f.company_id = project.company_id;
            f.business_type = project.business_type;
            this.autoBusinessType = true;
          }
        }
        this.form = f;
      }
    },
  },
};
