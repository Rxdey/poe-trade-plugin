<template>
    <div class=":uno: group text-foreground text-xs mt-10 relative cursor-pointer inline-block pt-10">
        <span title="该功能尚在实验阶段, 不保证内容准确。如发现对不上的请前往插件页面反馈">查看天赋位置</span>
        <div class=":uno: flex-col justify-center items-center bottom-100% abs-x-center bg-black/90 hidden group-hover:flex">
            <canvas ref="canvas" :width="size" :height="size"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';

const size = ref(180);
const show = ref(false);
const canvas = ref<HTMLCanvasElement>();
type Types = {
    name: string;
    ps: string;
    order: number;
};
type DataType = {
    num: string;
    attribute: string;
    types: Types[];
};
const props = defineProps<{ data: DataType }>();

const createCanvas = (num: number, types: Types[]) => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    const centerX = canvas.value.width / 2;
    const centerY = canvas.value.height / 2;
    const radius = 50;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 计算并绘制小圆点
    const numDots = 12;
    const len = types.length;
    let count = 0;
    const angleStep = (2 * Math.PI) / numDots;
    const startingAngle = -Math.PI; // 从右边中间开始
    for (let i = 0; i < numDots; i++) {
        const angle = startingAngle + i * angleStep;
        let dotRadius = 4;
        ctx.fillStyle = 'gray';
        // 珠宝槽位置
        if (i === 4 || i === 8) dotRadius = 6;
        const pointPosition = [];
        if (len >= 1) pointPosition.push(6);
        if (len >= 2) pointPosition.push(10);
        if (len >= 3) pointPosition.push(2);
        if (pointPosition.includes(i)) {
            dotRadius = 8;
            ctx.fillStyle = '#4dc64d'
        }
        const ignoreList: number[] = [];
        if (num <= 11) ignoreList.push(1);
        if (num <= 10) ignoreList.push(11);
        if (num <= 9) ignoreList.push(3);

        if (ignoreList.includes(i)) continue;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;


        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);

        ctx.fill();
        if (pointPosition.includes(i)) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(types[count].name, x - 60, y + 5);
            count += 1;
        }
    }
};
onMounted(() => {
    createCanvas(parseInt(props.data.num), props.data.types);
});

</script>

<style scoped>
.Cluster {}
</style>
