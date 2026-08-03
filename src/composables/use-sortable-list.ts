import Sortable from 'sortablejs';
import { onBeforeUnmount, watch, type Ref } from 'vue';

export const useSortableList = (
    containerRef: Ref<HTMLElement | null>,
    onReorder: (orderedIds: string[]) => void | Promise<void>
): void => {
    let sortable: Sortable | null = null;

    watch(
        containerRef,
        element => {
            sortable?.destroy();
            sortable = null;
            if (!element) return;
            sortable = Sortable.create(element, {
                animation: 150,
                handle: '[data-sort-handle]',
                ghostClass: 'ptp-sort-ghost',
                onEnd: () => {
                    const ids = Array.from(element.querySelectorAll<HTMLElement>(':scope > [data-sort-id]'))
                        .map(item => item.dataset.sortId)
                        .filter((id): id is string => Boolean(id));
                    void onReorder(ids);
                },
            });
        },
        { flush: 'post' }
    );

    onBeforeUnmount(() => sortable?.destroy());
};
