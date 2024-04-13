import { defineConfig, presetAttributify, presetUno, presetIcons, transformerVariantGroup } from 'unocss';
import presetRemToPx from '@unocss/preset-rem-to-px';

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify({
            prefix: 'un-',
            prefixedOnly: true,
        }),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
            },
            warn: true,
        }),
        presetRemToPx({
            //基准字体大小  官方的默认预设16（1单位 = 0.25rem）所以这里为4 为1：1
            baseFontSize: 4,
        }),
    ],
    transformers: [transformerVariantGroup()],
    shortcuts: [
        {
            'flex-center': 'f-row justify-center items-center',
            'fc-center': 'f-col justify-center items-center',
            'f-col': 'flex flex-col',
            'f-row': 'flex flex-row',
            'wh-full': 'w-full h-full',
            'cover-image': 'w-full h-full object-cover',
            'contain-image': 'w-full h-full object-contain',
            'ellipsis': 'text-ellipsis overflow-hidden whitespace-nowrap',
            'abs-x-center': 'absolute left-50% -transform-translate-x-50%',
            'abs-y-center': 'absolute top-50% -transform-translate-y-50%',
            'abs-center': 'absolute top-50% left-50% -transform-translate-50%',
            // 'd-btn': 'text-center px-4 py-6 cursor-pointer select-none border-1 border-solid relative',
            // 'brown-btn': 'bg-btnbrown text-foreground border-btnbrownborder',
            // 'blue-btn': 'bg-btnblue text-foreground  border-btnblueborder'
        },
    ],
    rules: [
        [/^sd-(\d+)$/, ([, d]) => ({ 'box-shadow': `0 0 16px 0 rgba(0,0,0,.${d})` })],
        [/^bc-(.+)$/, ([, color]) => ({ 'border-color': `#${color}` })],
        [/^t-a-(\d+)$/, ([, d]) => ({ transition: `all 0.${d}s linear` })],
        [/^l-s-(\d+)$/, ([, d]) => ({ 'letter-spacing': `${d}px` })],
        [/^wh-(\d+)$/, ([, d]) => ({ width: `${d}px`, height: `${d}px` })],
    ],
    theme: {
        background: {},
        colors: {
            primary: 'rgb(var(--color-primary))',
            success: 'rgb(var(--color-success))',
            info: 'rgb(var(--color-info))',
            warning: 'rgb(var(--color-warning))',
            danger: 'rgb(var(--color-danger))',
            gray: 'rgb(var(--color-gray))',
            dark: 'rgb(var(--color-dark))',
            white: 'rgb(var(--color-white))',
            background: 'rgb(var(--background))',
            foreground: 'rgb(var(--foreground))',

            blue: 'rgb(var(--color-blue))',
            brown: 'rgb(var(--color-brown))',

            btnblueborder: 'rgb(var(--btn-blue-border))',
            btnbrownborder: 'rgb(var(--btn-brown-border))',
        },
        fontSize: {
            base: '14px',
            xs: '12px',
            sm: '14px',
            lg: '16px',
            xl: '18px',
        },
    },
});
