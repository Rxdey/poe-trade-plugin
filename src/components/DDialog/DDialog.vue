<template>
    <Teleport to="body">
        <Transition name="scale-up">
            <div class=":uno: bg-white text-dark fixed top-30% left-50% z-2001 min-w-400 -translate-x-50% translate-y-0 transform-origin-left-center rounded-12 z-1000" @click.stop v-if="visible">
                <div class=":uno: px-20 pt-20 pb-10 f-row justify-between">
                    <slot name="title">
                        <span class=":uno: text-xl">{{ title }}</span>
                    </slot>
                    <!-- <i class=":uno: i-mdi:close cursor-pointer" @click="onCancel"></i> -->
                </div>
                <div class=":uno: p-20">
                    <slot></slot>
                </div>

            </div>
        </Transition>
        <DMask @click="onCancel" :show="visible" zIndex="2000"/>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useVModel } from '@vueuse/core';
import DMask from '../DMask/DMask.vue';

const emit = defineEmits(['update:modelValue', 'confirm']);
const props = withDefaults(defineProps<{
    modelValue?: boolean;
    title?: string;
    beforeClose?: (e: boolean) => (Promise<boolean> | boolean)
}>(), {
    modelValue: false,
    title: '',
})

const visible = useVModel(props, 'modelValue', emit);
const loading = ref(false);

const onClose = async (e: boolean) => {
    if (loading.value) return;
    if (props.beforeClose) {
        loading.value = true;
        const res = await props.beforeClose(e);
        loading.value = false;
        if (!res) return;
    }
    visible.value = false;
}

const onCancel = () => {
    onClose(false);
};
const onConfirm = () => {
    emit('confirm');
    onClose(true);
};
</script>

<style scoped>
</style>
