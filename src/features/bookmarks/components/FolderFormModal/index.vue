<template>
    <AppModal :model-value="modelValue" :title="folder ? '编辑文件夹' : '新建文件夹'" @update:model-value="close">
        <label class="ptp-field">
            <span>文件夹名称</span>
            <input v-model="title" maxlength="30" placeholder="例如：本赛季装备" @keyup.enter="submit" />
        </label>
        <div class="ptp-field">
            <span>图标</span>
            <div class="ptp-icon-grid">
                <button
                    v-for="option in iconOptions"
                    :key="option.value"
                    type="button"
                    class="ptp-folder-icon-option"
                    :class="{ 'is-selected': icon === option.value }"
                    :title="option.label"
                    @click="icon = option.value"
                >
                    <FolderIcon :icon="option.value" />
                </button>
            </div>
        </div>
        <template #footer>
            <AppButton label="取消" variant="ghost" @click="close(false)" />
            <AppButton label="保存" icon="i-mdi-content-save" :disabled="!title.trim()" @click="submit" />
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AppButton from '@/components/AppButton/index.vue';
import AppModal from '@/components/AppModal/index.vue';
import FolderIcon from '@/components/FolderIcon/index.vue';
import type { BookmarkFolder, FolderIconId } from '@/types';

const props = defineProps<{ modelValue: boolean; folder: BookmarkFolder | null }>();
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    save: [payload: { title: string; icon: FolderIconId | null }];
}>();

const iconOptions: Array<{ value: FolderIconId; label: string }> = [
    { value: 'folder', label: '文件夹' },
    { value: 'weapon', label: '武器' },
    { value: 'armor', label: '防具' },
    { value: 'jewel', label: '珠宝' },
    { value: 'currency', label: '通货' },
    { value: 'map', label: '地图' },
    { value: 'gem', label: '技能宝石' },
    { value: 'misc', label: '其他' },
];

const title = ref('');
const icon = ref<FolderIconId | null>('folder');

watch(
    () => [props.modelValue, props.folder] as const,
    () => {
        if (!props.modelValue) return;
        title.value = props.folder?.title ?? '';
        icon.value = props.folder?.icon ?? 'folder';
    },
    { immediate: true }
);

const close = (value = false): void => emit('update:modelValue', value);
const submit = (): void => {
    if (!title.value.trim()) return;
    emit('save', { title: title.value.trim(), icon: icon.value });
};
</script>
