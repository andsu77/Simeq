// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
    classifyVibrationLevel,
    parseVibrationRms,
    VIBRATION_LEVEL_HIGH_M_S2,
    VIBRATION_LEVEL_MEDIUM_M_S2
} from '../frontend/vibration';

describe('SIMEQ vibration serial reader', () => {
    test('reads RMS from the fourth CSV column, regardless of textual status', () => {
        expect(parseVibrationRms('-0.12,0.04,10.63,0.06,NORMAL')).toBe(0.06);
        expect(parseVibrationRms('-0.12,0.04,10.63,0.80,NORMAL')).toBe(0.8);
        expect(parseVibrationRms('-0.12,0.04,10.63,1.70,NORMAL')).toBe(1.7);
    });

    test('reads RMS from the SIMEQ sketch output', () => {
        expect(parseVibrationRms('Vibracao_RMS:0.625 Nivel:1')).toBe(0.625);
    });

    test('classifies low, medium and high vibration using RMS in m/s²', () => {
        expect(classifyVibrationLevel(0.06)).toBe(0);
        expect(classifyVibrationLevel(VIBRATION_LEVEL_MEDIUM_M_S2)).toBe(1);
        expect(classifyVibrationLevel(VIBRATION_LEVEL_HIGH_M_S2 - 0.01)).toBe(1);
        expect(classifyVibrationLevel(VIBRATION_LEVEL_HIGH_M_S2)).toBe(2);
    });

    test('rejects malformed, empty and negative vibration values', () => {
        expect(parseVibrationRms('')).toBeNull();
        expect(parseVibrationRms('a,b,c,,NORMAL')).toBeNull();
        expect(parseVibrationRms('Vibracao_RMS:-0.1 Nivel:0')).toBeNull();
        expect(parseVibrationRms('not serial output')).toBeNull();
    });
});
