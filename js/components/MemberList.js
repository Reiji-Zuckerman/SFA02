/**
 * SFA02 - メンバー管理
 * メンバーの一覧表示・追加・編集
 */

const MemberList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-people"></i> メンバー管理</h2>
        <button class="btn btn-primary btn-sm" @click="showAddModal = true">
          <i class="bi bi-plus-lg"></i> メンバー追加
        </button>
      </div>

      <!-- メンバーテーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>氏名</th>
              <th>メール</th>
              <th>ロール</th>
              <th>担当企業数</th>
              <th>未着手タスク</th>
              <th>ステータス</th>
              <th style="width:80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in sortedMembers" :key="m.id" :class="{'opacity-50': !m.is_active}">
              <td><strong>{{ m.name }}</strong></td>
              <td style="font-size:12px">{{ m.email }}</td>
              <td><span :class="'badge-biz badge-' + m.role">{{ m.role }}</span></td>
              <td>{{ getMemberStats(m.id).companyCount }}</td>
              <td>
                <span :class="getMemberStats(m.id).taskCount > 5 ? 'text-danger fw-bold' : ''">
                  {{ getMemberStats(m.id).taskCount }}
                </span>
              </td>
              <td>
                <span v-if="m.is_active" class="badge bg-success" style="font-size:11px">在籍</span>
                <span v-else class="badge bg-secondary" style="font-size:11px">退職</span>
              </td>
              <td>
                <button class="btn btn-outline-secondary btn-sm" @click="editMember(m)" style="font-size:11px; padding:2px 8px">
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- メンバー追加/編集モーダル -->
      <div class="modal-backdrop" v-if="showAddModal || showEditModal" @click.self="closeModals">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ showEditModal ? 'メンバー編集' : 'メンバー追加' }}</h5>
              <button type="button" class="btn-close" @click="closeModals"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label required-label">氏名</label>
                <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': errors.name}">
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label required-label">メールアドレス</label>
                <input v-model="form.email" type="email" class="form-control" :class="{'is-invalid': errors.email}">
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label required-label">ロール</label>
                <select v-model="form.role" class="form-select" :class="{'is-invalid': errors.role}">
                  <option value="">選択してください</option>
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
                <div class="invalid-feedback">{{ errors.role }}</div>
              </div>
              <div class="mb-3" v-if="showEditModal">
                <label class="form-label">ステータス</label>
                <div class="form-check form-switch">
                  <input v-model="form.is_active" class="form-check-input" type="checkbox" role="switch">
                  <label class="form-check-label">{{ form.is_active ? '在籍' : '退職' }}</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">キャンセル</button>
              <button type="button" class="btn btn-primary" @click="save" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  props: ['members', 'currentMemberId'],

  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      form: { name: '', email: '', role: '', is_active: true },
      editId: null,
      errors: {},
      saving: false,
      roles: CONSTANTS.ROLES,
      tasks: [],
      companies: [],
    };
  },

  computed: {
    sortedMembers() {
      return [...this.members].sort((a, b) => {
        if (a.is_active !== b.is_active) return b.is_active - a.is_active;
        return a.name.localeCompare(b.name);
      });
    },
  },

  methods: {
    getMemberStats(memberId) {
      const taskCount = this.tasks.filter(t => t.assigned_member_id === memberId && t.status === '未着手').length;
      const companyCount = this.companies.filter(c =>
        c.members && c.members.some(name => {
          const m = this.members.find(x => x.id === memberId);
          return m && name === m.name;
        })
      ).length;
      return { taskCount, companyCount };
    },

    editMember(m) {
      this.form = { name: m.name, email: m.email, role: m.role, is_active: m.is_active };
      this.editId = m.id;
      this.errors = {};
      this.showEditModal = true;
    },

    closeModals() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.form = { name: '', email: '', role: '', is_active: true };
      this.editId = null;
      this.errors = {};
    },

    validate() {
      this.errors = {};
      if (!this.form.name.trim()) this.errors.name = '氏名は必須です';
      if (!this.form.email.trim()) this.errors.email = 'メールアドレスは必須です';
      if (!this.form.role) this.errors.role = 'ロールは必須です';
      return Object.keys(this.errors).length === 0;
    },

    async save() {
      if (!this.validate()) return;
      this.saving = true;
      // モックではリロードで反映（実際にはAPI経由）
      if (this.showEditModal && this.editId) {
        const m = this.members.find(x => x.id === this.editId);
        if (m) Object.assign(m, this.form);
      } else {
        this.members.push({
          id: 'm' + Date.now(),
          ...this.form,
          is_active: true,
        });
      }
      this.saving = false;
      this.closeModals();
    },

    async loadStats() {
      const [tasks, companies] = await Promise.all([
        API.getTaskList(),
        API.getCompanyList(),
      ]);
      this.tasks = tasks;
      this.companies = companies;
    },
  },

  async mounted() {
    await this.loadStats();
  },
};
