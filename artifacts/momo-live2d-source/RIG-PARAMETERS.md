# Momo Cubism rig parameters

This is the parameter and deformer contract to apply after importing
`Momo_Live2D_Source_v1.psd` into Live2D Cubism Editor.

## Deformer hierarchy

```text
ROOT
├─ BODY_XYZ
│  ├─ HEAD_XYZ
│  │  ├─ FACE_BASE
│  │  ├─ EYE_L / EYE_R
│  │  ├─ MOUTH
│  │  ├─ FRONT_HAIR
│  │  ├─ EAR_L / EAR_R
│  │  └─ HAIR_L_ROOT / HAIR_R_ROOT
│  │     └─ HAIR_*_MID
│  │        └─ HAIR_*_TIP
│  ├─ ARM_L_SHOULDER
│  │  └─ ARM_L_UPPER -> ARM_L_FOREARM -> HAND_L
│  ├─ ARM_R_SHOULDER
│  │  └─ ARM_R_UPPER -> ARM_R_FOREARM -> HAND_R
│  ├─ SLEEVE_L_FRONT / SLEEVE_L_INNER / SLEEVE_L_BACK
│  └─ SLEEVE_R_FRONT / SLEEVE_R_INNER / SLEEVE_R_BACK
└─ ACCESSORIES
   ├─ BOW_CENTER -> BELL_CENTER
   ├─ RIBBON_L -> POMPOM_L
   └─ RIBBON_R -> POMPOM_R
```

## Standard parameters

| ID | Min | Default | Max | Keyforms |
| --- | ---: | ---: | ---: | --- |
| `ParamAngleX` | -30 | 0 | 30 | -30, -15, 0, 15, 30 |
| `ParamAngleY` | -30 | 0 | 30 | -30, 0, 30 |
| `ParamAngleZ` | -30 | 0 | 30 | -30, 0, 30 |
| `ParamBodyAngleX` | -10 | 0 | 10 | -10, 0, 10 |
| `ParamBodyAngleY` | -10 | 0 | 10 | -10, 0, 10 |
| `ParamBodyAngleZ` | -10 | 0 | 10 | -10, 0, 10 |
| `ParamEyeBallX` | -1 | 0 | 1 | -1, 0, 1 |
| `ParamEyeBallY` | -1 | 0 | 1 | -1, 0, 1 |
| `ParamEyeLOpen` | 0 | 1 | 1 | 0, 0.5, 1 |
| `ParamEyeROpen` | 0 | 1 | 1 | 0, 0.5, 1 |
| `ParamMouthOpenY` | 0 | 0 | 1 | 0, 0.5, 1 |
| `ParamMouthForm` | -1 | 0 | 1 | -1, 0, 1 |
| `ParamBreath` | 0 | 0 | 1 | 0, 0.5, 1 |

## Momo custom parameters

| ID | Min | Default | Max | Purpose |
| --- | ---: | ---: | ---: | --- |
| `ParamArmLShoulder` | -1 | 0 | 1 | left shoulder lift |
| `ParamArmLUpper` | -1 | 0 | 1 | left upper-arm rotation |
| `ParamArmLForearm` | -1 | 0 | 1 | left elbow bend |
| `ParamHandL` | -1 | 0 | 1 | left wrist and palm wave |
| `ParamArmRShoulder` | -1 | 0 | 1 | right shoulder lift |
| `ParamArmRUpper` | -1 | 0 | 1 | right upper-arm rotation |
| `ParamArmRForearm` | -1 | 0 | 1 | right elbow bend |
| `ParamHandR` | -1 | 0 | 1 | right wrist and palm wave |
| `ParamEarL` | -1 | 0 | 1 | left ear follow-through |
| `ParamEarR` | -1 | 0 | 1 | right ear follow-through |
| `ParamHairL` | -1 | 0 | 1 | left long-hair chain input |
| `ParamHairR` | -1 | 0 | 1 | right long-hair chain input |
| `ParamBow` | -1 | 0 | 1 | bow sway |
| `ParamBell` | -1 | 0 | 1 | bell lag and swing |
| `ParamPomL` | -1 | 0 | 1 | left pom-pom swing |
| `ParamPomR` | -1 | 0 | 1 | right pom-pom swing |

## Keyform rules

- Finish `ParamAngleX` first. At ±30, keep the far cheek, rear head, neck, and
  ear roots covered before combining it with Y/Z.
- Use four-corner synthesis only after X and Y extremes have been checked by
  hand. Do not synthesize missing source art.
- Arm parameters rotate deformers around the anatomical joints; ArtMeshes only
  correct the silhouette and fabric volume.
- The default pose must match the PSD exactly. Hidden underpaint may overlap,
  but two visible front-pose layers must not display the same pixel.

## Physics groups

| Group | Input | Output chain |
| --- | --- | --- |
| `PhysicsHairL` | `ParamAngleX`, `ParamBodyAngleX` | `ParamHairL` root -> mid -> tip |
| `PhysicsHairR` | `ParamAngleX`, `ParamBodyAngleX` | `ParamHairR` root -> mid -> tip |
| `PhysicsEars` | `ParamAngleX`, `ParamAngleZ` | `ParamEarL`, `ParamEarR` |
| `PhysicsBowBell` | `ParamBodyAngleX`, `ParamBodyAngleZ` | `ParamBow`, `ParamBell` |
| `PhysicsPompoms` | `ParamBodyAngleX`, arm parameters | `ParamPomL`, `ParamPomR` |

## Website motion groups

- `Idle`: breathing, eye blink, subtle body and accessory motion.
- `TapBody`: large wave driven by shoulder, upper arm, forearm, and wrist
  parameters. The current website calls this group when Momo is clicked.
