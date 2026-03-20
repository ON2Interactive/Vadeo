import { Layer, LayerKeyframe, LayerType, TextLayer, ShapeLayer, ImageLayer } from '../../types';

export class TimelineEngine {
    /**
     * Returns a virtual layer with properties interpolated for the given time.
     */
    static getInterpolatedLayer(layer: Layer, time: number): Layer {
        if (!layer.keyframes || layer.keyframes.length === 0) {
            return layer;
        }

        // Sort keyframes by time just in case
        const keyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);

        // 1. Before first keyframe
        if (time <= keyframes[0].time) {
            return { ...layer, ...this.extractProperties(keyframes[0]) } as any as Layer;
        }

        // 2. After last keyframe
        if (time >= keyframes[keyframes.length - 1].time) {
            return { ...layer, ...this.extractProperties(keyframes[keyframes.length - 1]) } as any as Layer;
        }

        // 3. Between two keyframes
        let start = keyframes[0];
        let end = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
                start = keyframes[i];
                end = keyframes[i + 1];
                break;
            }
        }

        const duration = end.time - start.time;
        const progress = duration === 0 ? 0 : (time - start.time) / duration;

        // Interpolate numeric properties
        const interpolatedProps: Partial<Layer> = {};
        const numericProps: (keyof LayerKeyframe)[] = ['x', 'y', 'rotation', 'opacity', 'width', 'height', 'fontSize'];

        numericProps.forEach(prop => {
            if (start[prop] !== undefined && end[prop] !== undefined) {
                // @ts-ignore
                interpolatedProps[prop] = start[prop] + (end[prop] - start[prop]) * progress;
            } else if (start[prop] !== undefined) {
                // @ts-ignore
                interpolatedProps[prop] = start[prop];
            } else if (end[prop] !== undefined) {
                // @ts-ignore
                interpolatedProps[prop] = end[prop];
            }
        });

        return { ...layer, ...interpolatedProps } as any as Layer;
    }

    private static extractProperties(keyframe: LayerKeyframe): Partial<Layer> {
        const props: any = {};
        if (keyframe.x !== undefined) props.x = keyframe.x;
        if (keyframe.y !== undefined) props.y = keyframe.y;
        if (keyframe.rotation !== undefined) props.rotation = keyframe.rotation;
        if (keyframe.opacity !== undefined) props.opacity = keyframe.opacity;
        if (keyframe.width !== undefined) props.width = keyframe.width;
        if (keyframe.height !== undefined) props.height = keyframe.height;
        if (keyframe.fontSize !== undefined) props.fontSize = keyframe.fontSize;
        return props;
    }
}
