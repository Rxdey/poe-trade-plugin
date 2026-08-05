<template>
    <div class="ptp-bottom-tools">
        <QuickTranslator
            :opened="activeTool === 'translator'"
            @update:opened="setToolOpened('translator', $event)"
        />
        <CookieExporter
            :opened="activeTool === 'cookie'"
            @update:opened="setToolOpened('cookie', $event)"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuickTranslator from '@/features/item-translation/components/QuickTranslator/index.vue';
import CookieExporter from '@/features/cookie-export/components/CookieExporter/index.vue';

type BottomTool = 'translator' | 'cookie';

const activeTool = ref<BottomTool | null>(null);

/** 保证底部工具同一时间只展开一个面板。 */
const setToolOpened = (tool: BottomTool, opened: boolean): void => {
    activeTool.value = opened ? tool : activeTool.value === tool ? null : activeTool.value;
};
</script>
