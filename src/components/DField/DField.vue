<template>
    <div class=":uno: DField">
        <div class=":uno: f-row pl-8 pr-0 border-b-1 border-t-0 border-l-0 border-r-0 border-solid border-#e5e5e5 items-center relative after:(content-empty absolute -bottom-1 left-0 h-2 bg-primary t-a-3 w-0%) h-40" :class="focus && 'after:(w-100%)'">
            <div class=":uno: text-primary min-w-60" v-if="label" @click.stop="onLabelClick">{{ label }}</div>
            <div class=":uno: flex-1 min-w-0 px-8">
                <input :type="type" v-model="value" class=":uno: outline-none border-none wh-full bg-transparent text-inherit" :placeholder="placeholder" ref="inputRef" @focus="onFocus" @blur="onBlur" :maxlength="max">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useVModel } from '@vueuse/core';

type Props = {
    modelValue?: string;
    label?: string;
    placeholder?: string;
    icon?: string;
    type?: string;
    max?: number;
    min?: number;
};
const emit = defineEmits(['update:modelValue', 'iconClick']);
const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    label: '',
    placeholder: '',
    icon: '',
    type: 'text',
});
const value = useVModel(props, 'modelValue', emit);
const focus = ref(false);
const inputRef = ref<HTMLInputElement>();

const onFocus = () => {
    focus.value = true;
};
const onBlur = () => {
    setTimeout(() => {
        focus.value = false;
    }, 0);
}

const onLabelClick = () => {
    if (inputRef.value) {
        inputRef.value.focus();
    }
};
const onIconClick = () => {
    emit('iconClick');
};

</script>

<style scoped></style>
