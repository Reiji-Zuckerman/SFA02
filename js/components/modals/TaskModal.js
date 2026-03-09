/**
 * タスク / アクション登録モーダル
 * 登録タイプ（タスク/アクション）で表示が変化
 * 担当メンバーのroleでアクション種別が変化
 */
const TaskModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'タスク編集' : '新規タスク登録' }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <!-- 登録タイプ -->
            <div class="mb-3" v-if="!isEdit">
              <label class="form-label required-label">登録タイプ</label>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm"
                        :class="form.register_type === 'task' ? 'btn-primary' : 'btn-outline-secondary'"
                        @click="form.register_type = 'task'">
                  タスク（未着手）
                </button>
                <button type="button" class="btn btn-sm"
                        :class="form.register_type === 'action' ? 'btn-primary' : 'btn-outline-secondary'"
                        @click="form.register_type = 'action'">
                  アクション（完了）
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label required-label">タイトル</label>
              <input v-model="form.title" type="text" class="form-control" :class="{'is-invalid': errors.title}">
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">担当メンバー</label>
                <select v-model="form.assigned_member_id" class="form-select" :class="{'is-invalid': errors.assigned_member_id}" @change="onMemberChange">
                  <option value="">選択してください</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.assigned_member_id }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">アクション種別</label>
                <select v-model="form.action_type" class="form-select">
                  <option value="">選択してください</option>
                  <option v-for="at in actionTypeOptions" :key="at" :value="at">{{ at }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">詳細・メモ</label>
              <textarea v-model="form.description" class="form-control" rows="2"></textarea>
            </div>

            <!-- タスクの場合のみ -->
            <template v-if="form.register_type === 'task'">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">期日</label>
                  <input v-model="form.due_date" type="date" class="form-control">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">優先度</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="">選択してください</option>
                    <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- 関連先 -->
            <div class="mb-3">
              <label class="form-label">関連先</label>
              <div class="d-flex gap-2 mb-2">
                <button type="button" class="btn btn-sm"
                        :class="relatedType === 'project' ? 'btn-outline-primary' : 'btn-outline-secondary'"
                        @click="relatedType = 'project'; form.contract_id = ''">
                  案件
                </button>
                <button type="button" class="btn btn-sm"
                        :class="relatedType === 'contract' ? 'btn-outline-primary' : 'btn-outline-secondary'"
                        @click="relatedType = 'contract'; form.project_id = ''">
                  契約
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary"
                        @click="relatedType = ''; form.project_id = ''; form.contract_id = ''">
                  なし
                </button>
              </div>
              <select v-if="relatedType === 'project'" v-model="form.project_id" class="form-select" @change="onProjectSelect">
                <option value="">選択してください</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.company_name || '' }} - {{ p.name }}</option>
              </select>
              <select v-if="relatedType === 'contract'" v-model="form.contract_id" class="form-select" @change="onContractSelect">
                <option value="">選択してください</option>
                <option v-for="cl in contractLines" :key="cl.id" :value="cl.id">{{ cl.company_name || '' }} - {{ cl.business_type }} ({{ cl.status }})</option>
              </select>
            </div>

            <!-- 企業（関連先未選択時は手動入力必須） -->
            <div class="mb-3">
              <label class="form-label" :class="{'required-label': !form.project_id && !form.contract_id}">企業</label>
              <select v-model="form.company_id" class="form-select" :class="{'is-invalid': errors.company_id}" :disabled="autoCompany" @change="onCompanyChange">
                <option value="">選択してください</option>
                <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <div class="invalid-feedback">{{ errors.company_id }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">部署</label>
              <select v-model="form.department_id" class="form-select" :disabled="autoDepartment">
                <option value="">選択してください</option>
                <option v-for="d in availableDepts" :key="d.id" :value="d.id">{{ d.name }}</option>
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
  props: ['show', 'editData', 'fixedCompanyId', 'members', 'companies', 'projects', 'contractLines', 'departments'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      relatedType: '',
      autoCompany: false,
      autoDepartment: false,
      priorities: CONSTANTS.PRIORITIES,
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
    actionTypeOptions() {
      if (!this.form.assigned_member_id || !this.members) return [];
      const member = this.members.find(m => m.id === this.form.assigned_member_id);
      if (!member) return [];
      return CONSTANTS.ACTION_TYPES[member.role] || [];
    },
    availableDepts() {
      if (!this.form.company_id || !this.departments) return [];
      return this.departments.filter(d => d.company_id === this.form.company_id);
    },
  },
  methods: {
    getEmptyForm() {
      return {
        register_type: 'task', title: '', description: '', due_date: '', priority: '',
        action_type: '', assigned_member_id: '', company_id: '', department_id: '',
        project_id: '', contract_id: '',
      };
    },
    onMemberChange() {
      this.form.action_type = '';
    },
    onProjectSelect() {
      if (this.form.project_id && this.projects) {
        const project = this.projects.find(p => p.id === this.form.project_id);
        if (project) {
          this.form.company_id = project.company_id;
          this.form.department_id = project.department_id || '';
          this.autoCompany = true;
          this.autoDepartment = !!project.department_id;
        }
      } else {
        this.autoCompany = false;
        this.autoDepartment = false;
      }
    },
    onContractSelect() {
      if (this.form.contract_id && this.contractLines) {
        const cl = this.contractLines.find(c => c.id === this.form.contract_id);
        if (cl) {
          this.form.company_id = cl.company_id || '';
          this.autoCompany = !!cl.company_id;
        }
      } else {
        this.autoCompany = false;
      }
      this.autoDepartment = false;
    },
    onCompanyChange() {
      this.form.department_id = '';
    },
    validate() {
      this.errors = {};
      if (!this.form.title.trim()) this.errors.title = 'タイトルは必須です';
      if (!this.form.assigned_member_id) this.errors.assigned_member_id = '担当メンバーは必須です';
      if (!this.form.company_id && !this.form.project_id && !this.form.contract_id) {
        this.errors.company_id = '関連先が未選択の場合、企業は必須です';
      }
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form };
      // アクションの場合はstatus=完了、期日・優先度なし
      if (data.register_type === 'action') {
        data.status = '完了';
        data.due_date = '';
        data.priority = '';
      } else {
        data.status = '未着手';
      }
      delete data.register_type;
      if (this.isEdit) {
        await API.updateTask(this.editData.id, data);
      } else {
        await API.createTask(data);
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
        this.autoCompany = false;
        this.autoDepartment = false;
        this.relatedType = '';
        if (this.editData && this.editData.id) {
          this.form = { ...this.editData, register_type: this.editData.status === '完了' ? 'action' : 'task' };
          if (this.editData.project_id) this.relatedType = 'project';
          else if (this.editData.contract_id) this.relatedType = 'contract';
        } else {
          const f = this.getEmptyForm();
          if (this.fixedCompanyId) {
            f.company_id = this.fixedCompanyId;
            this.autoCompany = true;
          }
          this.form = f;
        }
      }
    },
  },
};
