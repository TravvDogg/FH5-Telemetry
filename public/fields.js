/* \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\
------------------------------------------------------------------------
        Written by Travis Lizio | Creative Coding A3
------------------------------------------------------------------------
        fields.js: 
          Defines the telemetry data fields received from Forza
------------------------------------------------------------------------
\\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ */

const bufferOffset = 12

/**
 * Field definitions for Forza Horizon 5 telemetry data
 * Each field has:
 * - name: The name of the telemetry value
 * - min/max: The expected value range (used for debug visualization)
 * - offset: The byte offset in the UDP packet
 * - type: The data type/reader function to use
 * - transform (optional): Function to transform the raw value
 */
export default [
    // Game State
    {"name": "IsRaceOn",
    "min": -10,
    "max": 10,
    "offset": 0,
    "type": "Boolean",
},

    // Engine Data
    {"name": "EngineMaxRpm",
    "min": -10,
    "max": 10,
    "offset": 8,
    "type": "readFloatLE"
},

    {"name": "EngineIdleRpm",
    "min": -10,
    "max": 10,
    "offset": 12,
    "type": "readFloatLE"
},

    {"name": "CurrentEngineRpm",
    "min": -10,
    "max": 10,
    "offset": 16,
    "type": "readFloatLE"
},

    // Vehicle Dynamics
    {"name": "AccelerationX",
    "min": -10,
    "max": 10,
    "offset": 20,
    "type": "readFloatLE"
},

    {"name": "AccelerationY",
    "min": -10,
    "max": 10,
    "offset": 24,
    "type": "readFloatLE"
},

    {"name": "AccelerationZ",
    "min": -10,
    "max": 10,
    "offset": 28,
    "type": "readFloatLE"
},

    {"name": "VelocityX",
    "min": -10,
    "max": 10,
    "offset": 32,
    "type": "readFloatLE"
},

    {"name": "VelocityY",
    "min": -10,
    "max": 10,
    "offset": 36,
    "type": "readFloatLE"
},

    {"name": "VelocityZ",
    "min": -10,
    "max": 10,
    "offset": 40,
    "type": "readFloatLE"
},

    {"name": "AngularVelocityX",
    "min": -10,
    "max": 10,
    "offset": 44,
    "type": "readFloatLE"
},

    {"name": "AngularVelocityY",
    "min": -10,
    "max": 10,
    "offset": 48,
    "type": "readFloatLE"
},

    {"name": "AngularVelocityZ",
    "min": -10,
    "max": 10,
    "offset": 52,
    "type": "readFloatLE"
},

    // Vehicle Orientation
    {"name": "Yaw",
    "min": -10,
    "max": 10,
    "offset": 56,
    "type": "readFloatLE"
},

    {"name": "Pitch",
    "min": -10,
    "max": 10,
    "offset": 60,
    "type": "readFloatLE"
},

    {"name": "Roll",
    "min": -10,
    "max": 10,
    "offset": 64,
    "type": "readFloatLE"
},

    // Suspension Data
    {"name": "NormSuspensionTravelFl",
    "min": -10,
    "max": 10,
    "offset": 68,
    "type": "readFloatLE"
},

    {"name": "NormSuspensionTravelFr",
    "min": -10,
    "max": 10,
    "offset": 72,
    "type": "readFloatLE"
},

    {"name": "NormSuspensionTravelRl",
    "min": -10,
    "max": 10,
    "offset": 76,
    "type": "readFloatLE"
},

    {"name": "NormSuspensionTravelRr",
    "min": -10,
    "max": 10,
    "offset": 80,
    "type": "readFloatLE"
},

    // Tire Data
    {"name": "TireSlipRatioFl",
    "min": -10,
    "max": 10,
    "offset": 84,
    "type": "readFloatLE"
},

    {"name": "TireCombinedSlipFl",
    "min": -10,
    "max": 10,
    "offset": 180,
    "type": "readFloatLE"
},

    {"name": "TireSlipRatioFr",
    "min": -10,
    "max": 10,
    "offset": 88,
    "type": "readFloatLE"
},

    {"name": "TireCombinedSlipFr",
    "min": -10,
    "max": 10,
    "offset": 184,
    "type": "readFloatLE"
},

    {"name": "TireSlipRatioRl",
    "min": -10,
    "max": 10,
    "offset": 92,
    "type": "readFloatLE"
},

    {"name": "TireCombinedSlipRl",
    "min": -10,
    "max": 10,
    "offset": 188,
    "type": "readFloatLE"
},

    {"name": "TireSlipRatioRr",
    "min": -10,
    "max": 10,
    "offset": 96,
    "type": "readFloatLE"
},

    {"name": "TireCombinedSlipRr",
    "min": -10,
    "max": 10,
    "offset": 192,
    "type": "readFloatLE"
},

    {"name": "WheelRotationSpeedFl",
    "min": -10,
    "max": 10,
    "offset": 100,
    "type": "readFloatLE"
},

    {"name": "WheelRotationSpeedFr",
    "min": -10,
    "max": 10,
    "offset": 104,
    "type": "readFloatLE"
},

    {"name": "WheelRotationSpeedRl",
    "min": -10,
    "max": 10,
    "offset": 108,
    "type": "readFloatLE"
},

    {"name": "WheelRotationSpeedRr",
    "min": -10,
    "max": 10,
    "offset": 112,
    "type": "readFloatLE"
},

    {"name": "TireSlipAngleFl",
    "min": -10,
    "max": 10,
    "offset": 164,
    "type": "readFloatLE"
},

    {"name": "TireSlipAngleFr",
    "min": -10,
    "max": 10,
    "offset": 168,
    "type": "readFloatLE"
},

    {"name": "TireSlipAngleRl",
    "min": -10,
    "max": 10,
    "offset": 172,
    "type": "readFloatLE"
},

    {"name": "TireSlipAngleRr",
    "min": -10,
    "max": 10,
    "offset": 176,
    "type": "readFloatLE"
},

    // Suspension Travel
    {"name": "SuspensionTravelMetersFl",
    "min": -10,
    "max": 10,
    "offset": 196,
    "type": "readFloatLE"
},

    {"name": "SuspensionTravelMetersFr",
    "min": -10,
    "max": 10,
    "offset": 200,
    "type": "readFloatLE"
},

    {"name": "SuspensionTravelMetersRl",
    "min": -10,
    "max": 10,
    "offset": 204,
    "type": "readFloatLE"
},

    {"name": "SuspensionTravelMetersRr",
    "min": -10,
    "max": 10,
    "offset": 208,
    "type": "readFloatLE"
},

    // Car Information
    {"name": "CarOrdinal",
    "min": -10,
    "max": 10,
    "offset": 212,
    "type": "readUInt16LE"
},

    {"name": "CarClass",
    "min": -10,
    "max": 10,
    "offset": 216,
    "type": "readUInt8"
},

    {"name": "CarPerformanceIndex",
    "min": -10,
    "max": 10,
    "offset": 220,
    "type": "readUInt16LE"
},

    {"name": "DriveTrain",
    "min": -10,
    "max": 10,
    "offset": 224,
    "type": "readUInt8"
},

    {"name": "NumCylinders",
    "min": -10,
    "max": 10,
    "offset": 228,
    "type": "readUInt8"
},

    // Position and Speed
    {"name": "PositionX",
    "min": -10,
    "max": 10,
    "offset": 232 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "PositionY",
    "min": -10,
    "max": 10,
    "offset": 236 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "PositionZ",
    "min": -10,
    "max": 10,
    "offset": 240 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "Speed",
    "min": -10,
    "max": 10,
    "offset": 244 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "Power",
    "min": -10,
    "max": 10,
    "offset": 248 + bufferOffset,
    "type": "readFloatLE",
    "transform": value => value / 745.699872, // Convert from Watts to horsepower
},

    {"name": "Torque",
    "min": -10,
    "max": 10,
    "offset": 252 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "TireTempFl",
    "min": -10,
    "max": 10,
    "offset": 256 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "TireTempFr",
    "min": -10,
    "max": 10,
    "offset": 260 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "TireTempRl",
    "min": -10,
    "max": 10,
    "offset": 264 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "TireTempRr",
    "min": -10,
    "max": 10,
    "offset": 268 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "Boost",
    "min": -10,
    "max": 10,
    "offset": 272 + bufferOffset,
    "type": "readFloatLE",
    "transform": value => value / 14.504 // Convert from PSI to Bar
},

    {"name": "Fuel",
    "min": -10,
    "max": 10,
    "offset": 276 + bufferOffset,
    "type": "readFloatLE"
},

    // Race Information
    {"name": "Distance",
    "min": -10,
    "max": 10,
    "offset": 280 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "BestLapTime",
    "min": -10,
    "max": 10,
    "offset": 284 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "LastLapTime",
    "min": -10,
    "max": 10,
    "offset": 288 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "CurrentLapTime",
    "min": -10,
    "max": 10,
    "offset": 292 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "CurrentRaceTime",
    "min": -10,
    "max": 10,
    "offset": 296 + bufferOffset,
    "type": "readFloatLE"
},

    {"name": "Lap",
    "min": -10,
    "max": 10,
    "offset": 300 + bufferOffset,
    "type": "readUInt16LE"
},

    {"name": "RacePosition",
    "min": -10,
    "max": 10,
    "offset": 302 + bufferOffset,
    "type": "readUInt8"
},

    // Input Information
    {"name": "Accelerator",
    "min": 0,
    "max": 255,
    "offset": 303 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "Brake",
    "min": 0,
    "max": 255,
    "offset": 304 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "Clutch",
    "min": 0,
    "max": 255,
    "offset": 305 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "Handbrake",
    "min": 0,
    "max": 255,
    "offset": 306 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "Gear",
    "min": 0,
    "max": 10,
    "offset": 307 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "Steer",
    "min": -127,
    "max": 127,
    "offset": 308 + bufferOffset,
    "type": "readInt8"
},

    // AI Information
    {"name": "NormalDrivingLine",
    "min": -10,
    "max": 10,
    "offset": 309 + bufferOffset,
    "type": "readUInt8"
},

    {"name": "NormalAiBrakeDifference",
    "min": -10,
    "max": 10,
    "offset": 310 + bufferOffset,
    "type": "readUInt8"
}
]
