import type { ClusterJewelAnalysis } from '../types';

const PREVIEW_SIZE = 180;
const NODE_COUNT = 12;
const NOTABLE_POSITIONS = [6, 10, 2];
const SOCKET_POSITIONS = [4, 8];

const getIgnoredPositions = (passiveCount: number): number[] => {
    const ignoredPositions: number[] = [];
    if (passiveCount <= 11) ignoredPositions.push(1);
    if (passiveCount <= 10) ignoredPositions.push(11);
    if (passiveCount <= 9) ignoredPositions.push(3);
    return ignoredPositions;
};

/** 严格按旧版规则绘制大型星团天赋环。 */
export const createClusterPreview = (analysis: ClusterJewelAnalysis): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.className = 'ptp-cluster-ring';
    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${analysis.passiveCount} 天赋大型星团位置图`);

    const context = canvas.getContext('2d');
    if (!context) return canvas;

    const centerX = PREVIEW_SIZE / 2;
    const centerY = PREVIEW_SIZE / 2;
    const radius = 50;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.strokeStyle = 'gray';
    context.lineWidth = 2;
    context.stroke();

    const notablePositions = NOTABLE_POSITIONS.slice(0, analysis.notables.length);
    const ignoredPositions = getIgnoredPositions(analysis.passiveCount);
    const angleStep = (2 * Math.PI) / NODE_COUNT;
    const startingAngle = -Math.PI;
    let notableIndex = 0;

    for (let index = 0; index < NODE_COUNT; index += 1) {
        if (ignoredPositions.includes(index)) continue;
        const angle = startingAngle + index * angleStep;
        const isNotable = notablePositions.includes(index);
        let nodeRadius = 4;
        context.fillStyle = 'gray';
        if (SOCKET_POSITIONS.includes(index)) nodeRadius = 6;
        if (isNotable) {
            nodeRadius = 8;
            context.fillStyle = '#4dc64d';
        }

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        context.beginPath();
        context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        context.fill();

        if (!isNotable) continue;
        context.fillStyle = 'white';
        context.font = '12px Arial';
        context.fillText(analysis.notables[notableIndex].name, x - 60, y + 5);
        notableIndex += 1;
    }

    return canvas;
};
