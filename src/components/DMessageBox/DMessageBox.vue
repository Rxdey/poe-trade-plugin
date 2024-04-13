<template>
    <Teleport to="body">
        <DMask :show="show" @click="onMaskClick" z-index="3000"/>
        <Transition name="scale-up">
            <div class="bg-white text-dark fixed top-30% left-50% z-101 -translate-x-50% translate-y-0 transform-origin-left-center rounded-12 min-w-350 z-3001" @click.stop v-if="show">
                <div class="px-20 pt-20 pb-10 f-row justify-between">
                    <span class="text-xl">{{ title }}</span>
                    <i class="i-mdi:close cursor-pointer" @click="onCancel"></i>
                </div>
                <div class="p-20">
                    <div v-html="message"></div>
                </div>
                <div class="f-row justify-end gap-10 px-20 pt-10 pb-20">
                    <DButton round type="primary" variant="outline" size="md" :disabled="loading" @click="onCancel" v-if="showCancel">{{ cancelText }}</DButton>
                    <DButton round type="primary" variant="default" size="md" :loading="loading" @click="onConfirm">{{ confirmText }}</DButton>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { DButton, DMask } from '../index';
import { type Props } from './index';

const props = defineProps<Props>();

const emit = defineEmits(['update:visible'])
const loading = ref(false);
const show = ref(false);

const handleClose = () => {
    show.value = false;
    props.close?.();
}

const onMaskClick = () => {
    handleClose();
};
const onCancel = () => {
    handleClose();
};
const onConfirm = () => {
    props.confirm?.();
    show.value = false;
};

watch(() => props.visible, val => {
    setTimeout(() => {
        show.value = val;
    }, 0);
}, {
    immediate: true
})
</script>

<style scoped></style>