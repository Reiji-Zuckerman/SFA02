/**
 * SFA02 - Sidebar コンポーネント（グローバルナビゲーション）
 */

const Sidebar = {
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <i class="bi bi-briefcase-fill"></i> <span>SFA02</span>
      </div>
      <ul class="sidebar-nav">
        <li v-for="item in navItems" :key="item.path">
          <a :href="'#' + item.path"
             :class="{ active: currentRoute.startsWith(item.path) }"
             @click="$emit('navigate', item.path)">
            <i :class="'bi bi-' + item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
      <div class="sidebar-member">
        <div style="color: rgba(255,255,255,0.5);">ログインメンバー</div>
        <select :value="currentMemberId" @change="$emit('change-member', $event.target.value)">
          <option value="">全員</option>
          <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}（{{ m.role }}）</option>
        </select>
      </div>
      <div class="sidebar-connection" style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.1); font-size:11px;">
        <div style="color: rgba(255,255,255,0.5); margin-bottom:4px;">データ接続</div>
        <div v-if="isMock" style="color:#ffc107; cursor:pointer;" @click="showGasInput = !showGasInput">
          <i class="bi bi-database-x"></i> モックモード
        </div>
        <div v-else style="color:#28a745;">
          <i class="bi bi-database-check"></i> GAS接続中
          <a href="#" @click.prevent="disconnectGas" style="color:#ff6b6b; font-size:10px; margin-left:4px;">切断</a>
        </div>
        <div v-if="showGasInput" style="margin-top:6px;">
          <input v-model="gasUrlInput" type="text" placeholder="GAS Web App URL" style="width:100%; font-size:11px; padding:4px 6px; border:1px solid #555; border-radius:4px; background:#2a2a3a; color:#fff;">
          <button @click="connectGas" style="margin-top:4px; width:100%; font-size:11px; padding:3px; background:#0d6efd; color:#fff; border:none; border-radius:4px; cursor:pointer;">接続</button>
        </div>
      </div>
    </aside>
  `,
  props: ['currentRoute', 'currentMemberId', 'members'],
  data() {
    return {
      navItems: [
        { path: '/tasks', label: 'タスク一覧', icon: 'check2-square' },
        { path: '/companies', label: '企業一覧', icon: 'building' },
        { path: '/meetings', label: '商談一覧', icon: 'calendar-event' },
        { path: '/projects', label: '案件一覧', icon: 'kanban' },
        { path: '/jobs', label: '求人一覧', icon: 'person-badge' },
        { path: '/dashboard', label: '全社サマリー', icon: 'graph-up' },
        { path: '/members', label: 'メンバー管理', icon: 'people' },
      ],
      isMock: API.isUsingMock(),
      showGasInput: false,
      gasUrlInput: '',
    };
  },
  methods: {
    connectGas() {
      if (this.gasUrlInput.trim()) {
        API.setGasUrl(this.gasUrlInput.trim());
      }
    },
    disconnectGas() {
      API.setGasUrl('');
    },
  },
};
