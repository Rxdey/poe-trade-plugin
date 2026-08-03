<template><span :class="iconClass" aria-hidden="true"></span></template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FolderIconId } from '@/types';

const props = defineProps<{ icon: FolderIconId | null }>();
const ICON_CLASSES: Record<FolderIconId, string> = {
    folder: 'i-mdi-folder',
    weapon: 'i-mdi-sword-cross',
    armor: 'i-mdi-shield-half-full',
    jewel: 'i-mdi-diamond-stone',
    currency: 'i-mdi-coins',
    map: 'i-mdi-map',
    gem: 'i-mdi-hexagon-multiple',
    misc: 'i-mdi-package-variant-closed',
};
const iconClass = computed(() => ICON_CLASSES[props.icon ?? 'folder']);
</script>
