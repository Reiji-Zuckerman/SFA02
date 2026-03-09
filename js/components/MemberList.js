/**
 * SFA02 - メンバー管理プレースホルダー
 * Phase 5で完全実装
 */

const MemberList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-people"></i> メンバー管理</h2>
      </div>
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>氏名</th>
              <th>メール</th>
              <th>ロール</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td>{{ m.name }}</td>
              <td>{{ m.email }}</td>
              <td><span :class="'badge-biz badge-' + m.role">{{ m.role }}</span></td>
              <td>
                <span v-if="m.is_active" class="badge bg-success" style="font-size:11px">在籍</span>
                <span v-else class="badge bg-secondary" style="font-size:11px">退職</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['members'],
};
