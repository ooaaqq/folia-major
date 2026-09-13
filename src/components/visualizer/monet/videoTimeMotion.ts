const wrap01 = (value: number) => ((value % 1) + 1) % 1;

const smoothstep = (value: number) => value * value * (3 - 2 * value);

/** Samples a looping keyframe list from video time rather than wall-clock time. */
export const sampleVideoTimeLoop = (
    values: number[],
    seconds: number,
    duration: number,
    delay = 0,
) => {
    if (values.length === 0) return 0;
    if (values.length === 1 || duration <= 0 || seconds <= delay) return values[0];

    const segmentCount = values.length - 1;
    const position = wrap01((seconds - delay) / duration) * segmentCount;
    const fromIndex = Math.min(segmentCount - 1, Math.floor(position));
    const amount = smoothstep(position - fromIndex);
    return values[fromIndex] + (values[fromIndex + 1] - values[fromIndex]) * amount;
};
