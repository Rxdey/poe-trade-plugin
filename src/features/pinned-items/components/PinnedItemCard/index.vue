<template>
    <article class="ptp-pinned-card">
        <header class="ptp-pinned-card-header">
            <span><span class="i-mdi-pin"></span> {{ formatPinnedTime(item.pinnedAt) }}</span>
            <button type="button" class="ptp-icon-button" title="取消固定" @click="$emit('unpin', item.id)">
                <span class="i-mdi-close"></span>
            </button>
        </header>
        <div ref="detailsRef" class="ptp-pinned-details"></div>
        <div class="ptp-pinned-market">
            <div ref="renderedRef" class="ptp-pinned-rendered"></div>
            <div ref="pricingRef" class="ptp-pinned-price"></div>
        </div>
        <div class="ptp-pinned-actions">
            <AppButton label="定位商品" icon="i-mdi-crosshairs-gps" variant="blue" @click="$emit('locate', item.id)" />
            <AppButton label="取消固定" icon="i-mdi-pin-off" variant="ghost" @click="$emit('unpin', item.id)" />
        </div>
    </article>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppButton from '@/components/AppButton/index.vue';
import type { PinnedItem } from '@/types';

const props = defineProps<{ item: PinnedItem }>();
defineEmits<{ locate: [id: string]; unpin: [id: string] }>();

const detailsRef = ref<HTMLElement | null>(null);
const renderedRef = ref<HTMLElement | null>(null);
const pricingRef = ref<HTMLElement | null>(null);
const formatPinnedTime = (value: string): string =>
    `固定于 ${new Date(value).toLocaleTimeString('zh-CN', { hour12: false })}`;

onMounted(() => {
    detailsRef.value?.appendChild(props.item.detailsElement.cloneNode(true));
    renderedRef.value?.appendChild(props.item.renderedItemElement.cloneNode(true));
    pricingRef.value?.appendChild(props.item.pricingElement.cloneNode(true));
});
</script>
