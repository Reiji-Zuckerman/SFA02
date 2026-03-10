/**
 * SFA02 - カラム表示切替コンポーネント（共通）
 * 表示するカラムをユーザーが選択できる
 */

const ColumnToggle = {
  template: `
    <div class="column-toggle-wrapper" style="position:relative; display:inline-block">
      <button class="btn btn-outline-secondary btn-sm" @click="open = !open" title="カラム表示切替">
        <i class="bi bi-layout-three-columns"></i>
      </button>
      <div v-if="open" class="column-toggle-dropdown" @click.stop>
        <div class="filter-save-header">
          <strong style="font-size:12px">表示カラム</strong>
          <button class="btn-close btn-close-sm" style="font-size:10px" @click="open = false"></button>
        </div>
        <div v-for="col in allColumns" :key="col.key" class="column-toggle-item">
          <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer; margin:0">
            <input type="checkbox" :checked="visibleColumns.includes(col.key)"
                   @change="toggleColumn(col.key)" :disabled="col.required">
            {{ col.label }}
          </label>
        </div>
        <div style="padding:6px 12px; border-top:1px solid #eee">
          <button class="btn btn-link btn-sm p-0" @click="resetColumns" style="font-size:11px">リセット</button>
        </div>
      </div>
    </div>
  `,
  props: ['screenKey', 'allColumns'],
  emits: ['update'],
  data() {
    return {
      open: false,
      visibleColumns: [],
    };
  },
  methods: {
    loadSaved() {
      const defaultCols = this.allColumns.map(c => c.key);
      this.visibleColumns = FilterUtils.getColumnVisibility(this.screenKey, defaultCols);
      this.$emit('update', this.visibleColumns);
    },
    toggleColumn(key) {
      const idx = this.visibleColumns.indexOf(key);
      if (idx >= 0) {
        this.visibleColumns.splice(idx, 1);
      } else {
        // 元の順序を維持して挿入
        const allKeys = this.allColumns.map(c => c.key);
        this.visibleColumns.push(key);
        this.visibleColumns.sort((a, b) => allKeys.indexOf(a) - allKeys.indexOf(b));
      }
      FilterUtils.saveColumnVisibility(this.screenKey, this.visibleColumns);
      this.$emit('update', [...this.visibleColumns]);
    },
    resetColumns() {
      this.visibleColumns = this.allColumns.map(c => c.key);
      FilterUtils.saveColumnVisibility(this.screenKey, this.visibleColumns);
      this.$emit('update', [...this.visibleColumns]);
    },
  },
  mounted() {
    this.loadSaved();
    this._closeHandler = (e) => {
      if (!this.$el.contains(e.target)) this.open = false;
    };
    document.addEventListener('click', this._closeHandler);
  },
  beforeUnmount() {
    document.removeEventListener('click', this._closeHandler);
  },
};
