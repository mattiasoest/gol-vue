import { LIFE_PRESETS } from '@/engine/presets'

export type PresetId = keyof typeof LIFE_PRESETS

export function presetSelectOptions(): { value: PresetId; label: string }[] {
  return (Object.keys(LIFE_PRESETS) as PresetId[]).map((id) => ({
    value: id,
    label: LIFE_PRESETS[id]!.label,
  }))
}
