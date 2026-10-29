"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const vibration_1 = require("../frontend/vibration");
describe('SIMEQ vibration serial reader', () => {
    test('reads RMS from the fourth CSV column, regardless of textual status', () => {
        expect((0, vibration_1.parseVibrationRms)('-0.12,0.04,10.63,0.06,NORMAL')).toBe(0.06);
        expect((0, vibration_1.parseVibrationRms)('-0.12,0.04,10.63,0.80,NORMAL')).toBe(0.8);
        expect((0, vibration_1.parseVibrationRms)('-0.12,0.04,10.63,1.70,NORMAL')).toBe(1.7);
    });
    test('reads RMS from the SIMEQ sketch output', () => {
        expect((0, vibration_1.parseVibrationRms)('Vibracao_RMS:0.625 Nivel:1')).toBe(0.625);
    });
    test('classifies low, medium and high vibration using RMS in m/s²', () => {
        expect((0, vibration_1.classifyVibrationLevel)(0.06)).toBe(0);
        expect((0, vibration_1.classifyVibrationLevel)(vibration_1.VIBRATION_LEVEL_MEDIUM_M_S2)).toBe(1);
        expect((0, vibration_1.classifyVibrationLevel)(vibration_1.VIBRATION_LEVEL_HIGH_M_S2 - 0.01)).toBe(1);
        expect((0, vibration_1.classifyVibrationLevel)(vibration_1.VIBRATION_LEVEL_HIGH_M_S2)).toBe(2);
    });
    test('rejects malformed, empty and negative vibration values', () => {
        expect((0, vibration_1.parseVibrationRms)('')).toBeNull();
        expect((0, vibration_1.parseVibrationRms)('a,b,c,,NORMAL')).toBeNull();
        expect((0, vibration_1.parseVibrationRms)('Vibracao_RMS:-0.1 Nivel:0')).toBeNull();
        expect((0, vibration_1.parseVibrationRms)('not serial output')).toBeNull();
    });
});
//# sourceMappingURL=vibration.test.js.map