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
    };
  },
};
