<template>
    <Teleport to="body">
        <div v-if="modelValue" class="ptp-modal-backdrop" @click.self="close">
            <section class="ptp-modal" role="dialog" aria-modal="true" :aria-label="title">
                <header class="ptp-modal-header">
                    <h3>{{ title }}</h3>
                    <button type="button" class="ptp-icon-button" title="关闭" @click="close">
                        <span class="i-mdi-close"></span>
                    </button>
                </header>
                <div class="ptp-modal-body"><slot></slot></div>
                <footer v-if="$slots.footer" class="ptp-modal-footer"><slot name="footer"></slot></footer>
            </section>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const close = (): void => emit('update:modelValue', false);
</script>
