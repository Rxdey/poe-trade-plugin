<template>
    <button
        class="ptp-button"
        :class="[`is-${variant}`, { 'is-block': block }]"
        :disabled="disabled || loading"
        type="button"
        @click="$emit('click')"
    >
        <span v-if="icon" :class="icon" aria-hidden="true"></span>
        <span>{{ loading ? '处理中…' : label }}</span>
    </button>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        label: string;
        icon?: string;
        variant?: 'gold' | 'blue' | 'danger' | 'ghost';
        disabled?: boolean;
        loading?: boolean;
        block?: boolean;
    }>(),
    { icon: '', variant: 'gold', disabled: false, loading: false, block: false }
);

defineEmits<{ click: [] }>();
</script>
