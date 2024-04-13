<template>
    <button class=":uno: d-button outline-none border-none px-16 leading-[1] text-sm t-a-3 f-row items-center justify-center relative" :class="[
        { 'w-full': block, disabled: loading || disabled, 'rounded-full': round },
    ]" :style="customStyle" @click.stop="onClick">
        <span>
            <slot></slot>
        </span>
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

type BtnType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'brown' | 'blue';
type BtnVariant = 'default' | 'outline' | 'light' | 'text';
const emit = defineEmits(['click']);
const props = withDefaults(
    defineProps<{
        block?: boolean;
        type?: BtnType;
        round?: boolean;
        /** 变体样式 */
        variant?: BtnVariant;
        color?: string;
        loading?: boolean;
        disabled?: boolean;
        icon?: string;
        size?: 'sm' | 'md' | 'lg';
    }>(),
    {
        block: false,
        type: 'primary',
        variant: 'default',
        loading: false,
        disabled: false,
        round: false,
        size: 'sm'
    }
);

const createStyle = () => {
    const actions = {
        default: {
            '--b-type-alpha': 1,
            '--b-active-alpha': .9,
            '--b-color': 'white'
        },
        outline: {
            '--b-type-alpha': 0,
            '--b-border': `rgb(var(--color-${props.type}))`,
        },
        light: {
            '--b-type-alpha': .2,
            '--b-active-alpha': .3,
        },
        text: {
            '--b-type-alpha': 0,
        }
    };
    const size = {
        sm: `6px`,
        md: `10px`,
        lg: `16px`,
    };
    const style = {
        '--b-active-alpha': .2,
        '--b-type': `rgb(var(--color-${props.type}) / var(--b-type-alpha))`,
        '--b-active': `rgb(var(--color-${props.type}) / var(--b-active-alpha))`,
        '--b-color': `rgb(var(--color-${props.type}))`,
        '--b-border': 'transparent',
        '--b-size': size[props.size],
        ...actions[props.variant],
    };
    return style;
};
const customStyle = computed(() => {
    if (props.color) return `--b-type: ${props.color};`;
    return createStyle();
});

const onClick = () => {
    if (props.loading || props.disabled) return;
    emit('click');
}
</script>

<style scoped>
.d-button {
    --b-color: rgba(var(--color-white));
    --b-size: 12px;
    border: 1px solid var(--b-border);
    background-color: var(--b-type);
    color: var(--b-color);
    padding-bottom: var(--b-size);
    padding-top: var(--b-size);
}

.d-button:active,
.d-button:hover {
    background-color: var(--b-active);
}

.d-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.d-button.disabled:active,
.d-button.disabled:hover {
    background-color: var(--b-type);
}
</style>