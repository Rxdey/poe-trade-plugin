<template>
    <section class="ptp-quick-translator">
        <div v-if="opened" class="ptp-quick-translator-panel">
            <header class="ptp-quick-translator-header">
                <div>
                    <strong>快捷翻译</strong>
                    <small>国服装备文本 → 英文</small>
                </div>
                <button type="button" class="ptp-icon-button" title="关闭快捷翻译" @click="close">
                    <span class="i-mdi-close"></span>
                </button>
            </header>

            <div class="ptp-quick-translator-body">
                <textarea
                    v-model="itemText"
                    aria-label="需要翻译的装备文本"
                    placeholder="粘贴游戏或市集复制的完整装备文本…"
                    spellcheck="false"
                    @keydown.ctrl.enter.prevent="translateAndCopy"
                ></textarea>
                <p>翻译成功后会替换输入内容并自动复制。Ctrl + Enter 可快速执行。</p>
                <div class="ptp-quick-translator-actions">
                    <button type="button" class="ptp-button is-ghost" :disabled="processing || !itemText" @click="itemText = ''">
                        清空
                    </button>
                    <button type="button" class="ptp-button is-blue" :disabled="processing || !itemText.trim()" @click="translateAndCopy">
                        <span v-if="processing" class="i-mdi-loading ptp-spin"></span>
                        {{ processing ? '翻译中…' : '翻译并复制' }}
                    </button>
                </div>
            </div>
        </div>

        <button type="button" class="ptp-bottom-tool-button" :class="{ 'is-active': opened }" @click="toggle">
            <span class="i-mdi-translate"></span>
            <span>快捷翻译</span>
        </button>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { translateItemText } from '@/features/item-translation/services/item-translator';
import { useUiStore } from '@/stores/ui-store';
import { copyText } from '@/utils/clipboard';

const uiStore = useUiStore();
const props = defineProps<{ opened: boolean }>();
const emit = defineEmits<{ 'update:opened': [opened: boolean] }>();
const processing = ref(false);
const itemText = ref('');

const toggle = (): void => emit('update:opened', !props.opened);
const close = (): void => emit('update:opened', false);

/** 翻译输入文本、更新编辑框并复制英文结果。 */
const translateAndCopy = async (): Promise<void> => {
    if (processing.value || !itemText.value.trim()) return;
    processing.value = true;
    try {
        const result = translateItemText(itemText.value);
        if (!result.success) {
            uiStore.notify(result.error, 'error');
            return;
        }
        await copyText(result.data);
        itemText.value = result.data;
        uiStore.notify('英文装备文本已复制');
    } catch (error) {
        console.error('[POE Trade Plugin] 快捷翻译失败', error);
        uiStore.notify(error instanceof Error ? error.message : '快捷翻译失败', 'error');
    } finally {
        processing.value = false;
    }
};
</script>
