declare module 'colorthief' {
    type ColorTuple = [number, number, number];

    export default class ColorThief {
        getColor(img: HTMLImageElement | null, quality?: number): ColorTuple;
        getPalette(img: HTMLImageElement | null, colorCount?: number, quality?: number): ColorTuple[];
    }
}