/**
 * 商談登録・編集モーダル
 */
const MeetingModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? '商談編集' : '新規商談登録' }}</h5>
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
                <label class="form-label required-label">商談日</label>
                <input v-model="form.meeting_date" type="date" class="form-control" :class="{'is-invalid': errors.meeting_date}">
                <div class="invalid-feedback">{{ errors.meeting_date }}</div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">商談形式</label>
                <div class="d-flex gap-3 mt-1">
                  <div class="form-check" v-for="mt in meetingTypes" :key="mt">
                    <input class="form-check-input" type="radio" :value="mt" v-model="form.meeting_type" :id="'mt-' + mt">
                    <label class="form-check-label" :for="'mt-' + mt">{{ mt }}</label>
                  </div>
                </div>
                <div v-if="errors.meeting_type" class="text-danger" style="font-size:12px">{{ errors.meeting_type }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label required-label">商談取得者</label>
                <select v-model="form.setter_member_id" class="form-select" :class="{'is-invalid': errors.setter_member_id}">
                  <option value="">選択してください</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.setter_member_id }}</div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">参加メンバー（自社）</label>
                <select v-model="form.member_ids" class="form-select" multiple style="min-height:80px">
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <small class="text-muted">Ctrl+クリックで複数選択</small>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">参加担当者（先方）</label>
                <select v-model="form.contact_ids" class="form-select" multiple style="min-height:80px">
                  <option v-for="c in availableContacts" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">関連案件</label>
              <div class="d-flex gap-2">
                <select v-model="form.project_id" class="form-select" style="flex:1">
                  <option value="">なし</option>
                  <option v-for="p in availableProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">商談サマリー</label>
              <textarea v-model="form.summary" class="form-control" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">ネクストアクション</label>
              <textarea v-model="form.next_action" class="form-control" rows="2"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">無効理由</label>
              <select v-model="form.disqualified_reason" class="form-select">
                <option value="">なし（有効商談）</option>
                <option v-for="r in disqualifiedReasons" :key="r" :value="r">{{ r }}</option>
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
  props: ['show', 'editData', 'fixedCompanyId', 'members', 'companies', 'contacts', 'projects'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      meetingTypes: CONSTANTS.MEETING_TYPES,
      disqualifiedReasons: CONSTANTS.DISQUALIFIED_REASONS,
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
    availableContacts() {
      if (!this.form.company_id || !this.contacts) return [];
      return this.contacts.filter(c => c.company_id === this.form.company_id);
    },
    availableProjects() {
      if (!this.form.company_id || !this.projects) return [];
      return this.projects.filter(p => p.company_id === this.form.company_id);
    },
  },
  methods: {
    getEmptyForm() {
      return {
        company_id: '', meeting_date: '', meeting_type: '', setter_member_id: '',
        member_ids: [], contact_ids: [], project_id: '',
        summary: '', next_action: '', disqualified_reason: '',
      };
    },
    validate() {
      this.errors = {};
      if (!this.form.company_id) this.errors.company_id = '企業は必須です';
      if (!this.form.meeting_date) this.errors.meeting_date = '商談日は必須です';
      if (!this.form.meeting_type) this.errors.meeting_type = '商談形式は必須です';
      if (!this.form.setter_member_id) this.errors.setter_member_id = '商談取得者は必須です';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form };
      if (this.isEdit) {
        await API.updateMeeting(this.editData.id, data);
      } else {
        await API.createMeeting(data);
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
