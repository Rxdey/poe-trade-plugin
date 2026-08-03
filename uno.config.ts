import { defineConfig, presetIcons, presetUno, transformerVariantGroup } from 'unocss';

export default defineConfig({
    presets: [
        presetUno(),
        presetIcons({
            scale: 1.1,
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
            },
        }),
    ],
    transformers: [transformerVariantGroup()],
});
