/**
 * SFA02 - フィルター保存コンポーネント（共通）
 * よく使うフィルター条件を保存できる
 */

const FilterSave = {
  template: `
    <div class="filter-save-wrapper" style="position:relative; display:inline-block">
      <button class="btn btn-outline-secondary btn-sm" @click="open = !open" title="フィルター保存">
        <i class="bi bi-bookmark"></i>
        <span v-if="savedFilters.length" class="badge bg-secondary ms-1" style="font-size:10px">{{ savedFilters.length }}</span>
      </button>
      <div v-if="open" class="filter-save-dropdown" @click.stop>
        <div class="filter-save-header">
          <strong style="font-size:12px">保存済みフィルター</strong>
          <button class="btn-close btn-close-sm" style="font-size:10px" @click="open = false"></button>
        </div>
        <div v-if="savedFilters.length === 0" style="padding:8px 12px; font-size:12px; color:#999">
          保存済みフィルターはありません
        </div>
        <div v-for="(sf, i) in savedFilters" :key="i" class="filter-save-item">
          <a href="#" @click.prevent="applyFilter(sf.filters)" style="flex:1; font-size:12px; text-decoration:none; color:var(--color-text)">
            {{ sf.name }}
          </a>
          <button class="btn btn-link btn-sm text-danger p-0" @click.stop="deleteFilter(i)" style="font-size:11px" title="削除">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="filter-save-add">
          <div class="d-flex gap-1">
            <input v-model="newName" type="text" class="form-control form-control-sm" placeholder="フィルター名"
                   style="font-size:12px" @keydown.enter="saveFilter">
            <button class="btn btn-primary btn-sm" @click="saveFilter" :disabled="!newName.trim()" style="font-size:11px; white-space:nowrap">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['screenKey', 'currentFilters'],
  emits: ['apply'],
  data() {
    return {
      open: false,
      newName: '',
      savedFilters: [],
    };
  },
  methods: {
    loadSaved() {
      this.savedFilters = FilterUtils.getSavedFilters(this.screenKey);
    },
    saveFilter() {
      if (!this.newName.trim()) return;
      this.savedFilters = FilterUtils.saveFilter(this.screenKey, this.newName.trim(), this.currentFilters);
      this.newName = '';
    },
    deleteFilter(index) {
      this.savedFilters = FilterUtils.deleteSavedFilter(this.screenKey, index);
    },
    applyFilter(filters) {
      this.$emit('apply', JSON.parse(JSON.stringify(filters)));
      this.open = false;
    },
  },
  mounted() {
    this.loadSaved();
    // クリック外で閉じる
    this._closeHandler = (e) => {
      if (!this.$el.contains(e.target)) this.open = false;
    };
    document.addEventListener('click', this._closeHandler);
  },
  beforeUnmount() {
    document.removeEventListener('click', this._closeHandler);
  },
};
