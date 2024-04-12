<template>
    <Transition name="fade">
        <div
            class="mask bg-black/30 fixed top-0 left-0 bottom-0 right-0 z-200"
            v-if="show"
            @click="emit('click')"
            :style="{ 'z-index': zIndex, ...(styles || {}) }"
        ></div>
    </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
    show: boolean;
    styles?: any;
    zIndex?: string;
}>();
const emit = defineEmits(['click']);
</script>

<style scoped></style>
