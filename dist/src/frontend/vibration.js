"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIBRATION_LEVEL_HIGH_M_S2 = exports.VIBRATION_LEVEL_MEDIUM_M_S2 = void 0;
exports.parseVibrationRms = parseVibrationRms;
exports.classifyVibrationLevel = classifyVibrationLevel;
exports.VIBRATION_LEVEL_MEDIUM_M_S2 = 0.5;
exports.VIBRATION_LEVEL_HIGH_M_S2 = 1.5;
function parseVibrationRms(line) {
    const rmsFormat = line.match(/Vibracao_RMS:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/);
    const rms = rmsFormat
        ? Number(rmsFormat[1])
        : parseCsvRms(line);
    return rms !== null && Number.isFinite(rms) && rms >= 0 ? rms : null;
}
function parseCsvRms(line) {
    const columns = line.split(',').map(value => value.trim());
    if (columns.length < 5 || !columns[3])
        return null;
    const rms = Number(columns[3]);
    return Number.isFinite(rms) ? rms : null;
}
function classifyVibrationLevel(rms) {
    if (rms < exports.VIBRATION_LEVEL_MEDIUM_M_S2)
        return 0;
    if (rms < exports.VIBRATION_LEVEL_HIGH_M_S2)
        return 1;
    return 2;
}
//# sourceMappingURL=vibration.js.map