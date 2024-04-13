<template>
    <div class=":uno: relative">
        <Transition name="slider">
            <div class=":uno: w-full f-col gap-4 absolute bottom-100% left-0 mb-4 z-1 max-h-600 overflow-y-auto scroll-bar" v-show="show">
                <div class=":uno: px-8 py-6 bg-background text-foreground cursor-pointer f-row" v-for="(param, i) in searchKeys">
                    <span class=":uno: flex-1 hover:text-white break-all" @click="onSearch(param)">{{ param.label }}</span>
                    <span class=":uno: hover:text-danger" @click="onDel(i)">x</span>
                </div>
                <div class=":uno: px-8 py-4 bg-blue text-foreground cursor-pointer" @click="showCustom = true">+ 自定义</div>
            </div>
        </Transition>
        <DButton type="brown" class=":uno: w-120 z-2" @click="show = !show" title="具体物品和数值需要点击跳转后手动输入，只是有的词缀选起来很烦">快捷搜索</DButton>

        <DDialog v-model="showCustom">
            <template #title>
                <div>
                    <span class=":uno: text-20 mr-12">新增</span>
                    <a class=":uno: text-lightBlue hover:text-lightBlue visited:text-lightBlue" href="" target="_blank">详见说明</a>
                </div>
            </template>
            <div class=":uno: wh-full">
                <div class=":uno: f-row gap-10 mb-20">
                    <DButton type="danger" variant="outline" round @click="onReset">重置为默认</DButton>
                    <DButton round @click="onImport">批量导入</DButton>
                    <DButton round @click="onExport">导出</DButton>
                </div>
                <div>
                    <DField label="名字" v-model="form.label" placeholder="请输入名字" class=":uno: mb-20" :max="20" />
                    <DField label="查询字符串" v-model="form.value" placeholder="地址里最后的字符串.如:nw0p9VS0" class=":uno: mb-20" />
                    <div class=":uno: f-row justify-end gap-10 mb-20">
                        <DButton round variant="outline" size="md" class=":uno: min-w-120" @click="showCustom = false">取消</DButton>
                        <DButton round @click="onSave" size="md" class=":uno: min-w-120">保存</DButton>
                    </div>
                </div>

            </div>
        </DDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, toRaw } from 'vue';
import { SEARCH_PARAMS } from '@/config/data';
import { DDialog, DField, DButton, showMessageBox } from '@/components';
import { importFile, readFile, exportTxtFile, isValidConfig, mergeAndRemoveDuplicates } from '@/utils';

type SearchKeys = typeof SEARCH_PARAMS;

const show = ref(false);
const showCustom = ref(false);
const searchKeys = ref<SearchKeys>([]);

const form = ref({
    label: '',
    value: ''
})
/** 保存到本地 */
const saveStore = (arr: SearchKeys) => {
    localStorage.setItem('SEARCH_PARAMS', JSON.stringify(arr));
};

const onSearch = (data: (SearchKeys)[number]) => {
    let league = '';
    const localLeague = JSON.parse(localStorage.getItem('lscache-tradestate') || '{}');
    league = localLeague.league || window.location.href.match(/\/trade\/search\/([^/]+)/)![1];
    // console.log(league);
    window.open(`https://poe.game.qq.com/trade/search/${league}/${data.value}`, '_blank');
};
/** 删除 */
const onDel = (i: number) => {
    searchKeys.value.splice(i, 1);
    saveStore(searchKeys.value);
};
/** 新增 */
const onSave = () => {
    if (!form.value.label || !form.value.value) return;
    searchKeys.value.push(toRaw(form.value));
    nextTick(() => {
        form.value = {
            value: '',
            label: ''
        };
        saveStore(searchKeys.value);
    })
};
/** 重置 */
const onReset = async () => {
    const res = await showMessageBox({
        title: '注意',
        message: '重置后将恢复预设选项，所有自定义的列表都将被删除。是否继续?',
    });
    if (!res) return;
    console.log('yes')
    searchKeys.value = SEARCH_PARAMS;
    saveStore(SEARCH_PARAMS)
};
/** 导出 */
const onExport = async () => {
    const txt = JSON.stringify(searchKeys.value);
    exportTxtFile('trade_config.txt', txt);
};
/** 导入 */
const onImport = async () => {
    const files = await importFile();
    if (!files) {
        alert('获取文件失败');
        return;
    };
    const file = files[0];
    if (file.type !== 'text/plain') {
        await showMessageBox({ title: '注意', message: '仅支持txt文本', showCancel: false });
        return;
    }
    try {
        const text = await readFile(file);
        const data = JSON.parse(text as string);
        if (!isValidConfig(data)) {
            throw new Error("格式错误");
        }
        searchKeys.value = mergeAndRemoveDuplicates(toRaw(searchKeys.value), data);
        // searchKeys.value.push(...data)
        saveStore(searchKeys.value);
        showMessageBox({ title: '注意', message: '导入成功', showCancel: false });
    } catch (error) {
        console.error(error);
        await showMessageBox({ title: '注意', message: '文件读取异常，请确认格式正确', showCancel: false });
    }
};
onMounted(() => {
    const searchkeyStr = localStorage.getItem('SEARCH_PARAMS');
    if (!searchkeyStr) {
        searchKeys.value = SEARCH_PARAMS;
    } else {
        searchKeys.value = JSON.parse(searchkeyStr);
    }
    saveStore(searchKeys.value)
});
</script>

<style scoped></style>
