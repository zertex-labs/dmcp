import { data } from '..'
import type { Rarity, RarityOverwrite } from '.'

export const crops = [
  'CARROT',
  'CHORUS_FRUIT',
  'WHEAT',
  'SUGAR_CANE',
] as const
export type Crop = (typeof crops)[number]

export const isValidCrop = (crop: string): crop is Crop => crops.includes(crop as Crop)

export interface Food {
  probability: number
  price: number
  maxItems: number
  weight: number
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>
}

export function calculateCropPrice(cropName: Crop, amount: number) {
  const cropData = data.crops[cropName]
  return cropData.price * amount
}

export const validSellCropInputs = [...crops, 'ALL'] as const
export type ValidSellCropInput = (typeof validSellCropInputs)[number]

export const isValidSellCropInput = (input: string): input is ValidSellCropInput => validSellCropInputs.includes(input as ValidSellCropInput)
