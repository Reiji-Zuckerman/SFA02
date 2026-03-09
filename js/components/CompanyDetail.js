/**
 * SFA02 - 企業詳細ページ（A）
 * 1社に関する全情報を集約して確認・入力する
 * A-1〜A-7の全タブを実装
 */

const CompanyDetail = {
  template: `
    <div>
      <!-- パンくず -->
      <div class="page-header">
        <h2>
          <a href="#/companies" style="text-decoration:none; color: var(--color-text-muted); font-size:14px">
            <i class="bi bi-arrow-left"></i> 企業一覧
          </a>
        </h2>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border" role="status"></div>
      </div>

      <div v-if="!loading && !company" class="empty-state">企業が見つかりません</div>

      <div v-if="company && !loading">

        <!-- ===== A-1: 基本情報ヘッダー ===== -->
        <div class="company-header card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h3 class="mb-1" style="font-size:22px; font-weight:700; color:#1b2a4a;">
                  {{ company.name }}
                </h3>
                <span class="text-muted" style="font-size:13px" v-if="company.name_kana">{{ company.name_kana }}</span>
              </div>
              <div class="contract-status-row">
                <div v-for="bt in ['ITSS', 'PERM', 'DSL']" :key="bt" class="contract-status-item">
                  <span :class="'badge-biz badge-' + bt" style="font-size:9px">{{ bt }}</span>
                  <span v-if="contractStatusMap[bt]"
                        :class="'badge-status badge-' + contractStatusMap[bt]"
                        style="font-size:10px">
                    {{ contractStatusMap[bt] }}
                  </span>
                  <span v-else class="text-muted" style="font-size:11px">-</span>
                </div>
              </div>
            </div>

            <div class="row mt-3" style="font-size:13px;">
              <div class="col-md-4">
                <div class="mb-2"><i class="bi bi-briefcase text-muted"></i> <strong>業種:</strong> {{ company.industry || '-' }}</div>
                <div class="mb-2"><i class="bi bi-telephone text-muted"></i> <strong>電話:</strong> {{ company.phone || '-' }}</div>
                <div class="mb-2"><i class="bi bi-geo-alt text-muted"></i> <strong>住所:</strong> {{ company.address || '-' }}</div>
              </div>
              <div class="col-md-4">
                <div class="mb-2"><i class="bi bi-globe text-muted"></i> <strong>Web:</strong>
                  <span v-if="company.website_url">{{ company.website_url }}</span>
                  <span v-else>-</span>
                </div>
                <div class="mb-2"><i class="bi bi-megaphone text-muted"></i> <strong>リード獲得元:</strong> {{ company.lead_source || '-' }}</div>
              </div>
              <div class="col-md-4">
                <div class="mb-2"><i class="bi bi-people text-muted"></i> <strong>担当メンバー:</strong></div>
                <div v-if="companyMembers.length">
                  <span v-for="(cm, i) in companyMembers" :key="i"
                        class="badge bg-light text-dark me-1 mb-1" style="font-size:11px">
                    {{ cm.name }}（{{ cm.role }}）
                  </span>
                </div>
                <span v-else class="text-muted">-</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== タブナビゲーション ===== -->
        <ul class="nav nav-tabs mb-0" style="border-bottom: none;">
          <li class="nav-item" v-for="tab in tabs" :key="tab.key">
            <a class="nav-link" href="#"
               :class="{ active: activeTab === tab.key }"
               @click.prevent="activeTab = tab.key"
               style="font-size:13px;">
              <i :class="'bi bi-' + tab.icon"></i> {{ tab.label }}
              <span v-if="tab.count != null" class="badge bg-secondary ms-1" style="font-size:10px">{{ tab.count }}</span>
            </a>
          </li>
        </ul>

        <!-- ===== タブコンテンツ ===== -->
        <div class="card" style="border-top-left-radius:0;">
          <div class="card-body">

            <!-- A-2: 契約状況 -->
            <div v-if="activeTab === 'contract'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="font-size:15px; font-weight:600; margin:0;">契約状況</h5>
                <button class="btn btn-primary btn-sm" @click="showContractModal = true"><i class="bi bi-plus"></i> 契約追加</button>
              </div>
              <div v-if="contractLines.length === 0" class="empty-state">契約情報がありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th>事業区分</th>
                      <th>ステータス</th>
                      <th>締結日</th>
                      <th>リサイクル理由</th>
                      <th>未着手タスク</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cl in contractLines" :key="cl.id">
                      <td><span :class="'badge-biz badge-' + cl.business_type">{{ cl.business_type }}</span></td>
                      <td><span :class="'badge-status badge-' + cl.status">{{ cl.status }}</span></td>
                      <td>{{ cl.status === '締結済' ? formatDate(cl.contracted_date) : '-' }}</td>
                      <td>{{ cl.status === 'リサイクル' ? (cl.lost_reason || '-') : '-' }}</td>
                      <td>{{ getContractTaskCount(cl) }}件</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- A-3: 部署・担当者 -->
            <div v-if="activeTab === 'contacts'">
              <div class="row">
                <!-- 部署一覧 -->
                <div class="col-md-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 style="font-size:15px; font-weight:600; margin:0;">部署</h5>
                    <button class="btn btn-outline-primary btn-sm" @click="showDeptModal = true"><i class="bi bi-plus"></i></button>
                  </div>
                  <div v-if="departments.length === 0" class="empty-state" style="padding:20px">部署がありません</div>
                  <div class="list-group" v-else>
                    <a v-for="d in departments" :key="d.id" href="#"
                       class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                       :class="{ active: selectedDeptId === d.id }"
                       @click.prevent="selectedDeptId = d.id"
                       style="font-size:13px;">
                      {{ d.name }}
                      <span class="badge bg-primary rounded-pill">{{ getContactCountByDept(d.id) }}</span>
                    </a>
                    <a href="#" class="list-group-item list-group-item-action"
                       :class="{ active: selectedDeptId === null }"
                       @click.prevent="selectedDeptId = null"
                       style="font-size:13px;">
                      すべて
                    </a>
                  </div>
                </div>

                <!-- 担当者一覧 -->
                <div class="col-md-8">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 style="font-size:15px; font-weight:600; margin:0;">担当者</h5>
                    <button class="btn btn-primary btn-sm" @click="showContactModal = true"><i class="bi bi-plus"></i> 担当者追加</button>
                  </div>
                  <div v-if="filteredContacts.length === 0" class="empty-state" style="padding:20px">担当者がいません</div>
                  <div class="data-table" v-else>
                    <table>
                      <thead>
                        <tr>
                          <th>氏名</th>
                          <th>部署</th>
                          <th>役職</th>
                          <th>影響度</th>
                          <th>メール</th>
                          <th>電話</th>
                          <th>状態</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="c in filteredContacts" :key="c.id">
                          <td><strong>{{ c.name }}</strong></td>
                          <td>{{ getDeptName(c.department_id) }}</td>
                          <td>{{ c.title || '-' }}</td>
                          <td>
                            <span v-if="c.influence_type" class="badge"
                                  :class="{'bg-danger': c.influence_type==='決裁者', 'bg-info': c.influence_type==='担当者', 'bg-warning text-dark': c.influence_type==='インフルエンサー'}"
                                  style="font-size:10px">
                              {{ c.influence_type }}
                            </span>
                            <span v-else>-</span>
                          </td>
                          <td style="font-size:12px">{{ c.email || '-' }}</td>
                          <td style="font-size:12px">{{ c.phone || '-' }}</td>
                          <td>
                            <span v-if="c.is_active" class="text-success"><i class="bi bi-check-circle-fill"></i></span>
                            <span v-else class="text-muted"><i class="bi bi-dash-circle"></i></span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- A-4: 商談履歴 -->
            <div v-if="activeTab === 'meetings'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="font-size:15px; font-weight:600; margin:0;">商談履歴</h5>
                <button class="btn btn-primary btn-sm" @click="showMeetingModal = true"><i class="bi bi-plus"></i> 商談追加</button>
              </div>
              <div v-if="meetings.length === 0" class="empty-state">商談がありません</div>

              <!-- タイムライン風 -->
              <div v-else class="meeting-timeline">
                <div v-for="m in sortedMeetings" :key="m.id" class="card mb-2">
                  <div class="card-body" style="padding: 12px 16px;">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <span class="fw-bold" style="font-size:14px">{{ formatDate(m.meeting_date) }}</span>
                        <span class="badge bg-light text-dark ms-2" style="font-size:11px">{{ m.meeting_type }}</span>
                        <span class="badge bg-light text-dark ms-1" style="font-size:11px">{{ m.meeting_count }}回目</span>
                        <span v-if="m.disqualified_reason" class="badge-status badge-invalid ms-2" style="font-size:10px">
                          無効: {{ m.disqualified_reason }}
                        </span>
                      </div>
                      <div v-if="m.project_name && m.project_name !== '-'" style="font-size:12px" class="text-muted">
                        <i class="bi bi-kanban"></i> {{ m.project_name }}
                      </div>
                    </div>
                    <div class="mt-2" style="font-size:13px;">
                      <div v-if="m.summary" class="mb-1">{{ m.summary }}</div>
                      <div v-if="m.next_action" class="text-primary" style="font-size:12px">
                        <i class="bi bi-arrow-right-circle"></i> {{ m.next_action }}
                      </div>
                    </div>
                    <div class="mt-2 d-flex gap-3" style="font-size:11px; color: var(--color-text-muted)">
                      <span><i class="bi bi-person"></i> 取得: {{ m.setter_name }}</span>
                      <span v-if="m.member_names && m.member_names.length">
                        <i class="bi bi-people"></i> 参加: {{ m.member_names.join(', ') }}
                      </span>
                      <span v-if="m.contact_names && m.contact_names.length">
                        <i class="bi bi-person-badge"></i> 先方: {{ m.contact_names.join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- A-5: 案件 -->
            <div v-if="activeTab === 'projects'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="font-size:15px; font-weight:600; margin:0;">案件</h5>
                <button class="btn btn-primary btn-sm" @click="showProjectModal = true"><i class="bi bi-plus"></i> 案件追加</button>
              </div>
              <div v-if="projects.length === 0" class="empty-state">案件がありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th>案件名</th>
                      <th>事業区分</th>
                      <th>ステータス</th>
                      <th>担当</th>
                      <th>受注確度</th>
                      <th>提案金額</th>
                      <th>継続</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in projects" :key="p.id">
                      <td><strong>{{ p.name }}</strong></td>
                      <td><span :class="'badge-biz badge-' + p.business_type">{{ p.business_type }}</span></td>
                      <td><span :class="'badge-status badge-' + p.status">{{ p.status }}</span></td>
                      <td>{{ p.assigned_member_name }}</td>
                      <td>
                        <span v-if="p.business_type === 'DSL' && p.win_rate != null">{{ p.win_rate }}%</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span v-if="p.business_type === 'DSL' && p.estimated_revenue">{{ formatCurrency(p.estimated_revenue) }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span v-if="p.is_active" class="text-success"><i class="bi bi-check-circle-fill"></i></span>
                        <span v-else class="text-muted"><i class="bi bi-dash-circle"></i></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- A-6: 求人 -->
            <div v-if="activeTab === 'jobs'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="font-size:15px; font-weight:600; margin:0;">求人</h5>
                <button class="btn btn-primary btn-sm" @click="showJobModal = true"><i class="bi bi-plus"></i> 求人追加</button>
              </div>
              <div v-if="jobs.length === 0" class="empty-state">求人がありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th>求人タイトル</th>
                      <th>事業区分</th>
                      <th>部署</th>
                      <th>取得日</th>
                      <th>取得担当</th>
                      <th>関連案件</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="j in jobs" :key="j.id">
                      <td><strong>{{ j.job_title }}</strong></td>
                      <td><span :class="'badge-biz badge-' + j.business_type">{{ j.business_type }}</span></td>
                      <td>{{ j.department_name || '-' }}</td>
                      <td>{{ formatDate(j.acquired_date) }}</td>
                      <td>{{ j.member_names ? j.member_names.join(', ') : '-' }}</td>
                      <td>{{ j.project_name || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- A-7: タスク -->
            <div v-if="activeTab === 'tasks'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="font-size:15px; font-weight:600; margin:0;">タスク</h5>
                <div class="d-flex gap-2 align-items-center">
                  <select v-model="taskFilter" class="form-select form-select-sm" style="font-size:12px; width:auto; display:inline-block">
                    <option value="未着手">未着手のみ</option>
                    <option value="">すべて</option>
                  </select>
                  <button class="btn btn-primary btn-sm" @click="showTaskModal = true"><i class="bi bi-plus"></i> タスク追加</button>
                </div>
              </div>
              <div v-if="filteredTasks.length === 0" class="empty-state">タスクがありません</div>
              <div class="data-table" v-else>
                <table>
                  <thead>
                    <tr>
                      <th style="width:36px"></th>
                      <th>タイトル</th>
                      <th>種別</th>
                      <th>期日</th>
                      <th>優先度</th>
                      <th>担当</th>
                      <th>関連先</th>
                      <th>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in filteredTasks" :key="t.id"
                        :class="{ 'row-overdue': isOverdue(t) }">
                      <td>
                        <input type="checkbox" class="task-check"
                               :checked="t.status === '完了'"
                               @change="completeTask(t)"
                               :disabled="t.status === '完了'">
                      </td>
                      <td>{{ t.title }}</td>
                      <td>
                        <span v-if="t.action_type" class="badge bg-secondary" style="font-size:11px">{{ t.action_type }}</span>
                        <span v-else class="text-muted" style="font-size:12px">タスク</span>
                      </td>
                      <td :class="{ 'text-overdue': isOverdue(t) }">{{ formatDate(t.due_date) }}</td>
                      <td>
                        <span v-if="t.priority" :class="'badge-priority priority-' + t.priority">{{ t.priority }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>{{ t.assigned_member_name }}</td>
                      <td>{{ t.related_name }}</td>
                      <td>
                        <span :class="t.status === '完了' ? 'badge bg-success' : 'badge bg-light text-dark'" style="font-size:11px">
                          {{ t.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <!-- モーダル群 -->
        <contractline-modal :show="showContractModal" :company-id="companyId" :company-name="company.name" @close="showContractModal = false" @saved="onModalSaved"></contractline-modal>
        <department-modal :show="showDeptModal" :company-id="companyId" :company-name="company.name" @close="showDeptModal = false" @saved="onModalSaved"></department-modal>
        <contact-modal :show="showContactModal" :company-id="companyId" :company-name="company.name" :departments="departments" @close="showContactModal = false" @saved="onModalSaved" @dept-created="onModalSaved"></contact-modal>
        <meeting-modal :show="showMeetingModal" :fixed-company-id="companyId" :members="members" :companies="allCompanies" :contacts="contacts" :projects="projects" @close="showMeetingModal = false" @saved="onModalSaved"></meeting-modal>
        <project-modal :show="showProjectModal" :fixed-company-id="companyId" :members="members" :companies="allCompanies" :departments="departments" :contract-lines="contractLines" @close="showProjectModal = false" @saved="onModalSaved"></project-modal>
        <job-modal :show="showJobModal" :fixed-company-id="companyId" :members="members" :companies="allCompanies" :contacts="contacts" :projects="projects" :departments="departments" @close="showJobModal = false" @saved="onModalSaved"></job-modal>
        <task-modal :show="showTaskModal" :fixed-company-id="companyId" :members="members" :companies="allCompanies" :projects="projects" :contract-lines="contractLinesForTask" :departments="departments" @close="showTaskModal = false" @saved="onModalSaved"></task-modal>

      </div>
    </div>
  `,

  props: ['companyId', 'members'],

  data() {
    return {
      company: null,
      loading: true,
      activeTab: 'contract',
      selectedDeptId: null,
      taskFilter: '未着手',

      // モーダル表示フラグ
      showContractModal: false,
      showDeptModal: false,
      showContactModal: false,
      showMeetingModal: false,
      showProjectModal: false,
      showJobModal: false,
      showTaskModal: false,

      // 関連データ
      contractLines: [],
      departments: [],
      contacts: [],
      meetings: [],
      projects: [],
      jobs: [],
      tasks: [],
      companyMembers: [],
      allCompanies: [],
    };
  },

  computed: {
    tabs() {
      return [
        { key: 'contract', label: '契約状況', icon: 'file-earmark-text', count: this.contractLines.length },
        { key: 'contacts', label: '部署・担当者', icon: 'person-lines-fill', count: this.contacts.length },
        { key: 'meetings', label: '商談履歴', icon: 'calendar-event', count: this.meetings.length },
        { key: 'projects', label: '案件', icon: 'kanban', count: this.projects.length },
        { key: 'jobs', label: '求人', icon: 'person-badge', count: this.jobs.length },
        { key: 'tasks', label: 'タスク', icon: 'check2-square', count: this.tasks.filter(t => t.status === '未着手').length },
      ];
    },

    contractLinesForTask() {
      // TaskModalに渡す用（company_name付き）
      return this.contractLines.map(cl => ({
        ...cl,
        company_id: this.companyId,
        company_name: this.company ? this.company.name : '',
      }));
    },

    contractStatusMap() {
      const map = {};
      this.contractLines.forEach(cl => {
        map[cl.business_type] = cl.status;
      });
      return map;
    },

    sortedMeetings() {
      return [...this.meetings].sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
    },

    filteredContacts() {
      if (this.selectedDeptId === null) return this.contacts;
      return this.contacts.filter(c => c.department_id === this.selectedDeptId);
    },

    filteredTasks() {
      let result = [...this.tasks];
      if (this.taskFilter) {
        result = result.filter(t => t.status === this.taskFilter);
      }
      // 期限超過を上に、期日昇順
      result.sort((a, b) => {
        const aO = this.isOverdue(a) ? 0 : 1;
        const bO = this.isOverdue(b) ? 0 : 1;
        if (aO !== bO) return aO - bO;
        const aD = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
        const bD = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
        return aD - bD;
      });
      return result;
    },
  },

  methods: {
    async loadData() {
      this.loading = true;

      // 全データを並列取得
      const [company, contractData, departments, contacts, meetings, projects, jobs, tasks, allCompanies] = await Promise.all([
        API.getCompanyById(this.companyId),
        API.getContractByCompany(this.companyId),
        API.getDepartmentsByCompany(this.companyId),
        API.getContactsByCompany(this.companyId),
        API.getMeetingsByCompany(this.companyId),
        API.getProjectsByCompany(this.companyId),
        API.getJobsByCompany(this.companyId),
        API.getTasksByCompany(this.companyId),
        API.getCompanyList(),
      ]);

      this.company = company;
      this.contractLines = contractData.lines || [];
      this.departments = departments;
      this.contacts = contacts;
      this.meetings = await this.enrichMeetings(meetings);
      this.projects = await this.enrichProjects(projects);
      this.jobs = await this.enrichJobs(jobs);
      this.tasks = await this.enrichTasks(tasks);
      this.companyMembers = this.getCompanyMemberList();
      this.allCompanies = allCompanies;

      this.loading = false;
    },

    async onModalSaved() {
      // 全モーダルを閉じてデータリロード
      this.showContractModal = false;
      this.showDeptModal = false;
      this.showContactModal = false;
      this.showMeetingModal = false;
      this.showProjectModal = false;
      this.showJobModal = false;
      this.showTaskModal = false;
      await this.loadData();
    },

    // メンバー情報を取得してcompanyMembers一覧を作成
    getCompanyMemberList() {
      if (!this.members || !this.company) return [];
      // モックデータからCompanyMemberを引く簡易実装
      // 本番ではAPIで取得
      return this.members
        .filter(m => {
          // プロジェクトや商談で関わっているメンバーを抽出
          const inProject = this.projects.some(p => p.assigned_member_id === m.id);
          const inMeeting = this.meetings.some(mt => mt.setter_member_id === m.id);
          const inTask = this.tasks.some(t => t.assigned_member_id === m.id);
          return inProject || inMeeting || inTask;
        })
        .map(m => ({ name: m.name, role: m.role }));
    },

    async enrichMeetings(meetings) {
      // 商談にメンバー名・担当者名を付与
      const allMeetings = await API.getMeetingList();
      return meetings.map(m => {
        const enriched = allMeetings.find(am => am.id === m.id);
        return enriched || {
          ...m,
          setter_name: this.getMemberName(m.setter_member_id),
          member_names: [],
          contact_names: [],
          project_name: '-',
        };
      });
    },

    async enrichProjects(projects) {
      const allProjects = await API.getProjectList();
      return projects.map(p => {
        const enriched = allProjects.find(ap => ap.id === p.id);
        return enriched || { ...p, company_name: '', assigned_member_name: '' };
      });
    },

    async enrichJobs(jobs) {
      const allJobs = await API.getJobList();
      return jobs.map(j => {
        const enriched = allJobs.find(aj => aj.id === j.id);
        return enriched || { ...j, department_name: '-', project_name: '-', member_names: [] };
      });
    },

    async enrichTasks(tasks) {
      const allTasks = await API.getTaskList();
      return tasks.map(t => {
        const enriched = allTasks.find(at => at.id === t.id);
        return enriched || { ...t, assigned_member_name: '', related_name: '-' };
      });
    },

    getMemberName(memberId) {
      if (!memberId || !this.members) return '-';
      const m = this.members.find(x => x.id === memberId);
      return m ? m.name : '-';
    },

    getDeptName(deptId) {
      if (!deptId) return '-';
      const d = this.departments.find(x => x.id === deptId);
      return d ? d.name : '-';
    },

    getContactCountByDept(deptId) {
      return this.contacts.filter(c => c.department_id === deptId).length;
    },

    getContractTaskCount(cl) {
      // 当該ContractLineに紐づく未着手タスク数
      return this.tasks.filter(t => t.status === '未着手' && t.contract_id === cl.id).length;
    },

    formatDate(d) {
      return FilterUtils.formatDate(d);
    },

    formatCurrency(amount) {
      return FilterUtils.formatCurrency(amount);
    },

    isOverdue(task) {
      return task.status !== '完了' && FilterUtils.isOverdue(task.due_date);
    },

    async completeTask(task) {
      await API.completeTask(task.id);
      task.status = '完了';
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
