<template>
    <div class=":uno: fixed bottom-5 left-5 z-2000 f-row gap-4">
        <Translate />
        <Search />
        <!-- <div class=":uno: text-white flex-center ml-10">{{ tip }}</div> -->
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
// 翻译模块
import Translate from './Translate/Translate.vue';
// 搜索模块
import Search from './Search/Search.vue';
import Cluster from './Cluster/Cluster.vue';
import initObserver from './Translate/inject';
import { CLUSTER_LIST } from '@/config/data';

import { createApp } from 'vue';

const callBack = (e: HTMLElement) => {
    const infoEl = e.querySelector('.middle') as HTMLElement;
    const name = (infoEl!.querySelector('.itemHeader') as HTMLElement)?.innerText;
    if (!/大型星团珠宝/.test(name)) return;
    const info = infoEl?.innerText;
    const num = info.match(/增加 (\d+) 个天赋技能/);
    const attribute = info.match(/增加的小天赋获得：(.*)/);
    if (!num || !attribute) return;
    const regex = /其中 1 个增加的天赋为(.*)/g;
    let matches: string[] = [];
    let match;
    while ((match = regex.exec(info)) !== null) {
        if (match[1].trim()) {
            matches.push(match[1].replace(/【|】/g, ''));
        }
    };
    // console.log(info);
    console.log(matches);
    if (!matches.length) return;
    const currentType = CLUSTER_LIST.find(e => new RegExp(`^${e.attribute}`).test(attribute[1]));
    if (!currentType) return;
    const data = {
        num: num[1],
        attribute: attribute[1],
        types: currentType.detail.filter(e => matches.includes(e.name))
    };
    // console.log(data);
    const clusterCom = createApp(Cluster, {
        data
    });
    const wrap = document.createElement('div');
    const taget = e.querySelector('.left');
    if (taget) taget.append(wrap);
    clusterCom.mount(wrap);
}
onMounted(() => {
    initObserver(callBack);
});

</script>

<style scoped></style>
