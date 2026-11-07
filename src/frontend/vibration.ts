export const VIBRATION_LEVEL_MEDIUM_M_S2 = 0.5;
export const VIBRATION_LEVEL_HIGH_M_S2 = 1.5;

export function parseVibrationRms(line: string): number | null {
    const rmsFormat = line.match(/Vibracao_RMS:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/);
    const rms = rmsFormat
        ? Number(rmsFormat[1])
        : parseCsvRms(line);

    return rms !== null && Number.isFinite(rms) && rms >= 0 ? rms : null;
}

function parseCsvRms(line: string): number | null {
    const columns = line.split(',').map(value => value.trim());
    if (columns.length < 5 || !columns[3]) return null;

    const rms = Number(columns[3]);
    return Number.isFinite(rms) ? rms : null;
}

export function classifyVibrationLevel(rms: number): 0 | 1 | 2 {
    if (rms < VIBRATION_LEVEL_MEDIUM_M_S2) return 0;
    if (rms < VIBRATION_LEVEL_HIGH_M_S2) return 1;
    return 2;
}
