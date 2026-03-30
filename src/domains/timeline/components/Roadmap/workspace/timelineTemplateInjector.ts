const DEFAULT_DELEGATE_CLASS =
  'com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate'

type PrimitiveId = string | number

type DataSetLike<Row extends { id: PrimitiveId }> = {
  get: () => Row[]
  remove: (ids: PrimitiveId[]) => void
  update: (rows: Row[]) => void
}

type GroupLike = {
  id: PrimitiveId
  content?: string
  isOrganization?: boolean
  isSubgroup?: boolean
  isRoadmapProduct?: boolean
}

type ItemLike = {
  id: PrimitiveId
  ptrmType?: string
  title?: string
  technologyClassLv3Name?: string
  writingStatus?: string
  organizationNm?: string
  itemStatusName?: string
  titleEn?: string
  hasTrm?: boolean
  updateDate?: string
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function syncDataSetById<Row extends { id: PrimitiveId }>(
  targetDataSet: DataSetLike<Row>,
  nextRows: Row[],
): void {
  const safeRows = Array.isArray(nextRows) ? nextRows : []
  const previousRows = targetDataSet.get()
  const nextIdSet = new Set(safeRows.map((row) => String(row.id)))
  const removeIds = previousRows
    .filter((row) => !nextIdSet.has(String(row.id)))
    .map((row) => row.id)

  if (removeIds.length > 0) {
    targetDataSet.remove(removeIds)
  }

  if (safeRows.length > 0) {
    targetDataSet.update(safeRows)
  }
}

export function buildGroupTemplateHtml({
  group,
  isChecked,
  changeInfoText,
}: {
  group: GroupLike
  isChecked: boolean
  changeInfoText: string
}): string {
  const content = escapeHtml(group.content)

  if (group.isOrganization) {
    return `
   <div class="vis-group-wrapper" style="display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;">
    <label class="vis-group-label" style="display:flex;align-items:center;cursor:pointer;">${content}</label>
    <div class="group-history-wrap" style="display:flex;align-items:center;gap:8px;">
     <label class="mr-8 font-size-12">${escapeHtml(changeInfoText)}</label>
     <input class="group-history-switch" data-group-id="${escapeHtml(group.id)}" type="checkbox" />
    </div>
   </div>
  `
  }

  const canToggle = !group.isOrganization && !group.isSubgroup
  const toggleInput = canToggle
    ? `<input class="group-toggle-input mr-1" data-group-id="${escapeHtml(group.id)}" type="checkbox" ${isChecked ? 'checked' : ''} />`
    : ''

  return `
  <div class="vis-group-wrapper" style="display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;">
   <label class="vis-group-label ${group.isRoadmapProduct ? 'roadmap-product' : ''}" style="display:flex;align-items:center;cursor:pointer;">
    ${toggleInput}
    <span>${content}</span>
   </label>
  </div>
 `
}

export function buildItemTemplateHtml({
  data,
  activeArrowItemIds,
  delegateClass = DEFAULT_DELEGATE_CLASS,
}: {
  data: ItemLike
  activeArrowItemIds: Array<string | number>
  delegateClass?: string
}): string {
  const isPrm = data.ptrmType === 'PRM'
  const isActive = activeArrowItemIds.includes(data.id)
  const title = isPrm
    ? escapeHtml(data.title)
    : `${escapeHtml(data.technologyClassLv3Name || 'Not found level3!')} &gt; ${escapeHtml(data.title)}`

  const thumbnailUrl = `https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${encodeURIComponent(data.id)}&sectionType=-&ownerDelegateClass=${encodeURIComponent(delegateClass)}&createDate=${encodeURIComponent(data.updateDate || '')}`

  return `
  <div class="vis-item-contents">
   <div class="vis-item-head">
    <div class="vis-item-tags ${data.writingStatus === 'code001' ? 'lock' : ''} ${data.writingStatus === 'code002' ? 'unlock' : ''}">
     <span class="vis-item-name">${escapeHtml(data.organizationNm)}</span>
     <span class="vis-item-status">${escapeHtml(data.itemStatusName)}</span>
    </div>
    <div class="vis-item-comment"></div>
   </div>
   <div class="vis-item-body">
    <div class="vis-item-text">
     <div class="vis-item-title">${title}</div>
     <div class="vis-item-tech">${escapeHtml(data.titleEn)}</div>
    </div>
    ${isPrm
      ? `
     <div class="vis-item-imgwrap">
      <img class="vis-item-img" src="${thumbnailUrl}" />
      ${data.hasTrm ? `<div class="vis-item-add ${isActive ? 'active' : ''}" data-item-id="${escapeHtml(data.id)}">${isActive ? '-' : '+'}</div>` : ''}
     </div>
    `
      : ''
    }
   </div>
  </div>
 `
}

function parseEntityId(rawId: unknown): string | number | null | undefined {
  if (rawId === null || rawId === undefined || rawId === '') return rawId as null | undefined
  const numeric = Number(rawId)
  return Number.isNaN(numeric) ? String(rawId) : numeric
}

export type TemplateControlAction =
  | { type: 'toggle-item-link'; itemId: string | number }
  | { type: 'toggle-group'; groupId: string | number; checked: boolean }
  | { type: 'toggle-history'; groupId: string | number; checked: boolean }

export function resolveTemplateControlAction(event: Event): TemplateControlAction | null {
  const target = event.target
  if (!(target instanceof HTMLElement)) return null

  const addButton = target.closest('.vis-item-add')
  if (addButton instanceof HTMLElement) {
    const itemId = parseEntityId(addButton.dataset.itemId)
    if (itemId !== null && itemId !== undefined) {
      return { type: 'toggle-item-link', itemId }
    }
  }

  const groupToggle = target.closest('.group-toggle-input')
  if (groupToggle instanceof HTMLInputElement) {
    const groupId = parseEntityId(groupToggle.dataset.groupId)
    if (groupId !== null && groupId !== undefined) {
      return { type: 'toggle-group', groupId, checked: groupToggle.checked }
    }
  }

  const historySwitch = target.closest('.group-history-switch')
  if (historySwitch instanceof HTMLInputElement) {
    const groupId = parseEntityId(historySwitch.dataset.groupId)
    if (groupId !== null && groupId !== undefined) {
      return { type: 'toggle-history', groupId, checked: historySwitch.checked }
    }
  }

  return null
}
