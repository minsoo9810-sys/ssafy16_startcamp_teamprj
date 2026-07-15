export type PlaceType = 'tour' | 'leisure' | 'culture' | 'shopping' | 'lodging' | 'course' | 'festival'

export interface PlaceRecord {
  id: string
  sourceFile: string
  type: PlaceType
  typeLabel: string
  title: string
  address: string
  district: string | null
  lat: number | null
  lng: number | null
  imageUrl: string | null
  tel: string | null
  description: string
  contentTypeId: number | null
  lclsSystm1: string | null
  lclsSystm2: string | null
  lclsSystm3: string | null
  cat1: string | null
  cat2: string | null
  cat3: string | null
  searchText: string
  isValidCoordinate: boolean
}

export interface PlaceLoadResult {
  items: PlaceRecord[]
  loadedFiles: string[]
  total: number
}