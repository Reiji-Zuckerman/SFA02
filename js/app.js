/**
 * SFA02 - メインVueアプリケーション
 * Hash-based SPA ルーティング + グローバルストア
 */

const app = Vue.createApp({
  template: `
    <div class="app-layout">
      <sidebar
        :current-route="currentRoute"
        :current-member-id="currentMemberId"
        :members="members"
        @navigate="navigate"
        @change-member="changeMember">
      </sidebar>
      <main class="main-content">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <component v-else
          :is="currentComponent"
          :current-member-id="currentMemberId"
          :members="members"
          :company-id="routeParams.id"
          :project-id="routeParams.id">
        </component>
      </main>
    </div>
  `,
  data() {
    return {
      currentRoute: '/tasks',
      routeParams: {},
      members: [],
      currentMemberId: '',
      loading: true,
    };
  },
  computed: {
    currentComponent() {
      const path = this.currentRoute;
      if (path.startsWith('/companies/') && this.routeParams.id) return 'company-detail';
      if (path.startsWith('/projects/') && this.routeParams.id) return 'project-detail';
      const routes = {
        '/tasks': 'task-list',
        '/companies': 'company-list',
        '/meetings': 'meeting-list',
        '/projects': 'project-list',
        '/jobs': 'job-list',
        '/dashboard': 'dashboard-view',
        '/members': 'member-list',
      };
      return routes[path] || 'task-list';
    },
  },
  methods: {
    parseRoute() {
      const hash = window.location.hash.slice(1) || '/tasks';
      // /companies/:id のようなパスをパース
      const companyMatch = hash.match(/^\/companies\/(.+)$/);
      if (companyMatch) {
        this.currentRoute = '/companies/' + companyMatch[1];
        this.routeParams = { id: companyMatch[1] };
        return;
      }
      // /projects/:id のようなパスをパース
      const projectMatch = hash.match(/^\/projects\/(.+)$/);
      if (projectMatch) {
        this.currentRoute = '/projects/' + projectMatch[1];
        this.routeParams = { id: projectMatch[1] };
        return;
      }
      this.currentRoute = hash;
      this.routeParams = {};
    },
    navigate(path) {
      window.location.hash = '#' + path;
    },
    changeMember(id) {
      this.currentMemberId = id;
      localStorage.setItem('sfa02_member', id);
    },
    async init() {
      this.loading = true;
      this.members = await API.getMemberList();
      // 前回のメンバー選択を復元
      const saved = localStorage.getItem('sfa02_member');
      if (saved && this.members.find(m => m.id === saved)) {
        this.currentMemberId = saved;
      } else if (this.members.length > 0) {
        this.currentMemberId = this.members[0].id;
      }
      this.parseRoute();
      this.loading = false;
    },
  },
  mounted() {
    window.addEventListener('hashchange', () => this.parseRoute());
    this.init();
  },
});

// コンポーネント登録
app.component('sidebar', Sidebar);
app.component('task-list', TaskList);
app.component('company-list', CompanyList);
app.component('company-detail', CompanyDetail);
app.component('meeting-list', MeetingList);
app.component('project-list', ProjectList);
app.component('project-detail', ProjectDetail);
app.component('job-list', JobList);
app.component('dashboard-view', Dashboard);
app.component('member-list', MemberList);

// 共通コンポーネント
app.component('filter-save', FilterSave);
app.component('column-toggle', ColumnToggle);

// モーダルコンポーネント
app.component('company-modal', CompanyModal);
app.component('department-modal', DepartmentModal);
app.component('contact-modal', ContactModal);
app.component('contractline-modal', ContractLineModal);
app.component('meeting-modal', MeetingModal);
app.component('project-modal', ProjectModal);
app.component('job-modal', JobModal);
app.component('task-modal', TaskModal);

// アプリマウント
app.mount('#app');
