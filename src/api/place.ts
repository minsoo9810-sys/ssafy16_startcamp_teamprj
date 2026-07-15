import type { PlaceLoadResult, PlaceRecord, PlaceType } from '@/types/place'

interface ManifestFile {
  name: string
  type: PlaceType
  typeLabel: string
}

interface ManifestData {
  version: number
  files: ManifestFile[]
}

interface RawRecord {
  [key: string]: unknown
}

const manifestUrl = '/data/raw/manifest.json'

function safeString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function safeNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getTextValue(item: RawRecord, keys: string[]): string {
  for (const key of keys) {
    const value = item[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function getDistrict(address: string): string | null {
  const match = address.match(/([가-힣]+구)/)
  return match ? match[1] : null
}

function normalizePlace(
  item: RawRecord,
  sourceFile: string,
  type: PlaceType,
  typeLabel: string
): PlaceRecord {
  const title = getTextValue(item, ['title', 'name'])
  const address = getTextValue(item, ['addr1', 'address', 'addr'])
  const description = getTextValue(item, ['overview', 'summary', 'description', 'content'])
  const imageUrl = getTextValue(item, ['firstimage', 'firstImage', 'image1', 'image', 'thumbnail'])
  const tel = getTextValue(item, ['tel', 'telephone', 'phone'])

  const lat = safeNumber(item.mapy ?? item.mapY ?? item.lat ?? item.latitude)
  const lng = safeNumber(item.mapx ?? item.mapX ?? item.lng ?? item.longitude)
  const contentTypeId = safeNumber(item.contenttypeid ?? item.contentTypeId ?? item.contentType)

  const record: PlaceRecord = {
    id: safeString(item.contentid ?? item.id),
    sourceFile,
    type,
    typeLabel,
    title,
    address,
    district: getDistrict(address),
    lat,
    lng,
    imageUrl: imageUrl || null,
    tel: tel || null,
    description,
    contentTypeId,
    lclsSystm1: safeString(item.lclsSystm1) || null,
    lclsSystm2: safeString(item.lclsSystm2) || null,
    lclsSystm3: safeString(item.lclsSystm3) || null,
    cat1: safeString(item.cat1) || null,
    cat2: safeString(item.cat2) || null,
    cat3: safeString(item.cat3) || null,
    searchText: '',
    isValidCoordinate: lat !== null && lng !== null
  }

  record.searchText = [
    record.title,
    record.address,
    record.district ?? '',
    record.description,
    record.typeLabel
  ]
    .filter(Boolean)
    .join(' ')

  return record
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`데이터 로드 실패: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export async function loadPlaces(): Promise<PlaceLoadResult> {
  const manifest = await fetchJson<ManifestData>(manifestUrl)
  const files = manifest.files ?? []

  const items: PlaceRecord[] = []
  const loadedFiles: string[] = []

  for (const file of files) {
    try {
      const payload = await fetchJson<unknown>(`/data/raw/${file.name}`)

      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { items?: unknown[] }).items)
          ? (payload as { items: unknown[] }).items
          : []

      const normalized = rawItems.map((entry) =>
        normalizePlace(entry as RawRecord, file.name, file.type, file.typeLabel)
      )

      items.push(...normalized)
      loadedFiles.push(file.name)
    } catch {
      // 파일이 없거나 파싱 실패해도 다음 파일은 계속 시도
    }
  }

  return {
    items,
    loadedFiles,
    total: items.length
  }
}