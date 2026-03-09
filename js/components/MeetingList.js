/**
 * SFA02 - 商談一覧（B-3）
 * 商談活動の進捗と取得状況を把握する
 */

const MeetingList = {
  template: `
    <div>
      <div class="page-header">
        <h2><i class="bi bi-calendar-event"></i> 商談一覧</h2>
        <button class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg"></i> 商談追加
        </button>
      </div>

      <!-- フィルター -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>期間</label>
          <select v-model="filters.dateRange">
            <option value="">すべて</option>
            <option value="thisMonth">今月</option>
            <option value="lastMonth">先月</option>
            <option value="quarter">四半期</option>
          </select>
        </div>
        <div class="filter-group">
          <label>商談取得者</label>
          <select v-model="filters.setter_member_id">
            <option value="">全員</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>有効/無効</label>
          <select v-model="filters.validOnly">
            <option value="true">有効のみ</option>
            <option value="">すべて</option>
          </select>
        </div>
        <div class="filter-group">
          <label>商談形式</label>
          <select v-model="filters.meeting_type">
            <option value="">すべて</option>
            <option v-for="t in meetingTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <!-- テーブル -->
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>商談日</th>
              <th>企業名</th>
              <th>形式</th>
              <th>取得者</th>
              <th>参加メンバー</th>
              <th>先方参加者</th>
              <th>関連案件</th>
              <th>有効/無効</th>
              <th>回数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMeetings.length === 0">
              <td colspan="9" class="empty-state">商談がありません</td>
            </tr>
            <tr v-for="m in filteredMeetings" :key="m.id">
              <td>{{ formatDate(m.meeting_date) }}</td>
              <td>
                <a href="#" @click.prevent="goCompany(m.company_id)">{{ m.company_name }}</a>
              </td>
              <td>{{ m.meeting_type }}</td>
              <td>{{ m.setter_name }}</td>
              <td>
                <span v-for="(name, i) in m.member_names" :key="i">
                  {{ name }}<span v-if="i < m.member_names.length - 1">, </span>
                </span>
              </td>
              <td>
                <span v-for="(name, i) in m.contact_names" :key="i">
                  {{ name }}<span v-if="i < m.contact_names.length - 1">, </span>
                </span>
                <span v-if="!m.contact_names.length" class="text-muted">-</span>
              </td>
              <td>{{ m.project_name }}</td>
              <td>
                <span :class="m.is_valid ? 'badge-status badge-valid' : 'badge-status badge-invalid'">
                  {{ m.is_valid ? '有効' : '無効' }}
                </span>
              </td>
              <td>{{ m.meeting_count }}回目</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  props: ['currentMemberId', 'members'],
  data() {
    return {
      meetings: [],
      loading: true,
      meetingTypes: CONSTANTS.MEETING_TYPES,
      filters: {
        dateRange: 'thisMonth',
        setter_member_id: '',
        validOnly: 'true',
        meeting_type: '',
      },
    };
  },
  computed: {
    filteredMeetings() {
      let result = [...this.meetings];

      if (this.filters.dateRange) {
        result = result.filter(m => FilterUtils.matchDateRange(m, this.filters.dateRange));
      }
      if (this.filters.setter_member_id) {
        result = result.filter(m => m.setter_member_id === this.filters.setter_member_id);
      }
      if (this.filters.validOnly === 'true') {
        result = result.filter(m => m.is_valid);
      }
      if (this.filters.meeting_type) {
        result = result.filter(m => m.meeting_type === this.filters.meeting_type);
      }

      // 日付降順
      result.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
      return result;
    },
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.meetings = await API.getMeetingList();
      this.loading = false;
    },
    formatDate(d) {
      return FilterUtils.formatDate(d);
    },
    goCompany(id) {
      window.location.hash = '#/companies/' + id;
    },
  },
  async mounted() {
    await this.loadData();
  },
};
