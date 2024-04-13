<template>
    <div class=":uno: relative">
        <Transition name="slider">
            <div class=":uno: w-full f-col gap-2 absolute bottom-100% left-0 mb-4 z-1" v-show="show">
                <div class=":uno: bg-background flex-1 p-4">
                    <textarea class=":uno: w-full border-none outline-none resize-none bg-transparent text-foreground scroll-bar" rows="5" v-model="value" placeholder="在这里粘贴"></textarea>
                </div>
                <DButton type="blue" @click="onTranslate">翻译并复制</DButton>
            </div>
        </Transition>
        <DButton type="brown" class=":uno: w-150 z-2" @click="show = !show">{{ show ? '隐藏翻译界面' : '显示翻译界面' }}</DButton>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { copyToClipboard, translateItem } from '@/utils';
// import initObserver from './inject';

import { DButton, showMessageBox } from '@/components';

const show = ref(false);
const value = ref('');
const tip = ref('');

let st: any = null;
/** 翻译 */
const onTranslate = () => {
    const res = translateItem(value.value);
    if (!res) {
        tip.value = '转换异常，请重试';
        return;
    }
    value.value = res;
    copyToClipboard(value.value);
    tip.value = '已复制';
};
watch(
    () => tip.value,
    val => {
        if (val) {
            if (st) clearTimeout(st);
            st = setTimeout(() => {
                tip.value = '';
            }, 3000);
        }
    }
);
</script>

<style scoped></style>
