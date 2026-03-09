/**
 * 企業登録・編集モーダル
 */
const CompanyModal = {
  template: `
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? '企業編集' : '新規企業登録' }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label required-label">企業名</label>
              <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': errors.name}">
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">企業名カナ</label>
              <input v-model="form.name_kana" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">業種</label>
              <select v-model="form.industry" class="form-select">
                <option value="">選択してください</option>
                <option v-for="ind in industries" :key="ind" :value="ind">{{ ind }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">WebサイトURL</label>
              <input v-model="form.website_url" type="url" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">電話番号</label>
              <input v-model="form.phone" type="tel" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">住所</label>
              <input v-model="form.address" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">リード獲得元</label>
              <select v-model="form.lead_source" class="form-select">
                <option value="">選択してください</option>
                <option v-for="ls in leadSources" :key="ls" :value="ls">{{ ls }}</option>
              </select>
            </div>
            <!-- 紹介者（リード獲得元 = 紹介 の場合のみ） -->
            <div class="mb-3" v-if="form.lead_source === '紹介'">
              <label class="form-label">紹介者</label>
              <input v-model="form.referred_by_name" type="text" class="form-control" placeholder="紹介者名">
            </div>
            <!-- 担当メンバー -->
            <div class="mb-3">
              <label class="form-label required-label">担当メンバー</label>
              <div v-for="(cm, i) in form.company_members" :key="i" class="d-flex gap-2 mb-2 align-items-center">
                <select v-model="cm.member_id" class="form-select" style="flex:2">
                  <option value="">メンバー選択</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <select v-model="cm.role_in_company" class="form-select" style="flex:1">
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeMember(i)" v-if="form.company_members.length > 1">
                  <i class="bi bi-x"></i>
                </button>
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="addMember">
                <i class="bi bi-plus"></i> メンバー追加
              </button>
              <div v-if="errors.company_members" class="text-danger" style="font-size:12px; margin-top:4px">{{ errors.company_members }}</div>
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
  props: ['show', 'editData', 'members'],
  emits: ['close', 'saved'],
  data() {
    return {
      form: this.getEmptyForm(),
      errors: {},
      saving: false,
      industries: CONSTANTS.INDUSTRIES,
      leadSources: CONSTANTS.LEAD_SOURCES,
      roles: CONSTANTS.COMPANY_MEMBER_ROLES,
    };
  },
  computed: {
    isEdit() { return !!(this.editData && this.editData.id); },
  },
  methods: {
    getEmptyForm() {
      return {
        name: '', name_kana: '', industry: '', website_url: '',
        phone: '', address: '', lead_source: '', referred_by_name: '',
        company_members: [{ member_id: '', role_in_company: 'IS' }],
      };
    },
    addMember() {
      this.form.company_members.push({ member_id: '', role_in_company: 'IS' });
    },
    removeMember(i) {
      this.form.company_members.splice(i, 1);
    },
    validate() {
      this.errors = {};
      if (!this.form.name.trim()) this.errors.name = '企業名は必須です';
      const validMembers = this.form.company_members.filter(cm => cm.member_id);
      if (validMembers.length === 0) this.errors.company_members = '担当メンバーを1名以上選択してください';
      return Object.keys(this.errors).length === 0;
    },
    async save() {
      if (!this.validate()) return;
      this.saving = true;
      const data = { ...this.form };
      data.company_members = data.company_members.filter(cm => cm.member_id);
      if (this.isEdit) {
        await API.updateCompany(this.editData.id, data);
      } else {
        await API.createCompany(data);
      }
      this.saving = false;
      this.$emit('saved');
      this.close();
    },
    close() {
      this.$emit('close');
    },
  },
  watch: {
    show(v) {
      if (v) {
        this.errors = {};
        if (this.editData && this.editData.id) {
          this.form = { ...this.editData, company_members: this.editData.company_members || [{ member_id: '', role_in_company: 'IS' }] };
        } else {
          this.form = this.getEmptyForm();
        }
      }
    },
  },
};
