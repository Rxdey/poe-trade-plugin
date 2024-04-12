<template>
    <!-- <div class="fixed bottom-5 left-5 f-row text-sm gap-2 h-130 z-2000">
        <div class="custom-button bg-btnbrown text-foreground relative z-10 border-btnbrownborder [writing-mode:vertical-lr] " @click="show = !show">
            {{ show ? '隐藏翻译界面' : '显示翻译界面' }}
        </div>

        <Transition name="slider">
            <div class="flex-1 w-220 f-col gap-2" v-show="show">
                <div class="bg-background flex-1 p-4">
                    <textarea class="w-full border-none outline-none resize-none bg-transparent text-foreground" rows="6" v-model="value" placeholder="在这里粘贴"></textarea>
                </div>
                <div class="custom-button bg-btnblue text-foreground text-white/70 border-btnblueborder" @click="onTranslate">
                    翻译并复制
                </div>
            </div>
        </Transition>
        <div class="absolute right-0 bottom-100% py-4 text-white" v-if="!!tip && show">
            提示:{{ tip }}
        </div>
    </div> -->
    <div class="fixed bottom-5 left-5 z-2000 f-row gap-4">
        <div class="relative">
            <Transition name="slider">
                <div class="w-full f-col gap-2 absolute bottom-100% left-0 mb-4 z-1" v-show="show">
                    <div class="bg-background flex-1 p-4">
                        <textarea class="w-full border-none outline-none resize-none bg-transparent text-foreground" rows="5" v-model="value" placeholder="在这里粘贴"></textarea>
                    </div>
                    <div class="d-btn blue-btn" @click="onTranslate">
                        翻译并复制
                    </div>
                </div>
            </Transition>
            <div class="d-btn brown-btn w-180 z-2" @click="show = !show">
                {{ show ? '隐藏翻译界面' : '显示翻译界面' }}
            </div>
        </div>

        <div class="relative">
            <Transition name="slider">
                <div class="w-full f-col gap-2 absolute bottom-100% left-0 mb-4 z-1" v-show="showSearch">
                    <div class="px-8 py-4 bg-background text-foreground cursor-pointer f-row" title="具体物品和数值需要点击跳转后手动输入，只是有的词缀选起来很烦" v-for="(param, i) in searchKeys">
                        <span class="flex-1" @click="onSearch(param)">{{ param.label }}</span>
                        <span class="hover:text-danger" @click="onDel(i)">x</span>
                    </div>
                    <div class="px-8 py-4 bg-success text-foreground cursor-pointer" @click="showCustom = true">+ 自定义</div>
                </div>
            </Transition>

            <div class="d-btn brown-btn w-100 z-2" @click="showSearch = !showSearch">快捷搜索</div>
        </div>
        <DDialog v-model="showCustom" title="新增">
            <div class="wh-full">
                <DField label="名字" v-model="form.label" placeholder="请输入名字" class="mb-20" />
                <DField label="查询字符串" v-model="form.label" placeholder="地址里最后的字符串.如:nw0p9VS0" class="mb-20" />
            </div>
        </DDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { copyToClipboard, translateItem } from '@/utils';
import { monkeyWindow } from '$';
import { cdn, util } from 'vite-plugin-monkey';
import initObserver from './inject';
import { SEARCH_PARAMS } from '@/config/data';
import DDialog from '@/components/DDialog/DDialog.vue';
import DField from '@/components/DField/DField.vue';

const show = ref(false);
const showSearch = ref(false);
const showCustom = ref(false);
const value = ref('');
const tip = ref('');
const searchKeys = ref<typeof SEARCH_PARAMS>([]);
const form = ref({
    label: '',
    value: ''
})
let st: any = null;

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

const onSearch = (data: (typeof SEARCH_PARAMS)[number]) => {
    console.log(data.value);
};
const onDel = (i: number) => {
    console.log(i);
};
onMounted(() => {
    initObserver();
    const searchkeyStr = localStorage.getItem('SEARCH_PARAMS');
    if (!searchkeyStr) {
        searchKeys.value = SEARCH_PARAMS;
        localStorage.setItem('SEARCH_PARAMS', JSON.stringify(searchKeys.value));
    } else {
        searchKeys.value = JSON.parse(searchkeyStr);
    }
});
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
