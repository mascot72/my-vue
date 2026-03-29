const DELEGATE_CLASS = 'com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate'

type TemplateRecord = Record<string, unknown>

export const itemTemplate = (
  data: TemplateRecord,
  timelineState: { activeArrowItemIds: string[] },
) => {
  const writingClass =
    data.writingStatus === 'code001' ? 'lock' : data.writingStatus === 'code002' ? 'unlock' : ''
  const isActive = timelineState.activeArrowItemIds.includes(String(data.id))

  const titleHtml =
    data.ptrmType === 'PRM'
      ? `<div class="vis-item-title">${data.title || ''}</div>`
      : `<div class="vis-item-title">${data.technologyClassLv3Name || 'N/A'} > ${data.title || ''}</div>`

  let imageWrapHtml = ''
  if (data.ptrmType === 'PRM') {
    const imgSrc = `https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${data.id}&sectionType=-&ownerDelegateClass=${DELEGATE_CLASS}&createDate=${data.updateDate}`
    const addButtonHtml = data.hasTrm
      ? `<div class="vis-item-add ${isActive ? 'active' : ''}" data-action="add-item" data-id="${data.id}">${isActive ? '-' : '+'}</div>`
      : ''

    imageWrapHtml = `
      <div class="vis-item-imgwrap">
        <img class="vis-item-img" src="${imgSrc}" loading="lazy" />
        ${addButtonHtml}
      </div>`
  }

  return `
    <div class="vis-item-contents" data-id="${data.id}">
      <div class="vis-item-head">
        <div class="vis-item-tags ${writingClass}">
          <span class="vis-item-name">${data.organizationNm || ''}</span>
          <span class="vis-item-status">${data.itemStatusName || ''}</span>
        </div>
      </div>
      <div class="vis-item-body">
        <div class="vis-item-text">
          ${titleHtml}
          <div class="vis-item-tech">${data.titleEn || ''}</div>
        </div>
        ${imageWrapHtml}
      </div>
    </div>
  `
}

export const groupTemplate = (group: TemplateRecord, isChecked: boolean, msg: string) => {
  const isRootProductGroup = !group.isSubGroup || String(group.parent || '').startsWith('ORG-')
  const showCheckbox = !group.isOrganization && isRootProductGroup
  const checkboxHtml = showCheckbox
    ? `<input type="checkbox" class="vis-group-check" data-id="${group.id}" ${isChecked ? 'checked' : ''} />`
    : ''

  let extraHtml = ''
  if (group.isOrganization) {
    extraHtml = `
      <div class="vis-group-extra" @click.stop>
        <label class="msg-label">${msg || ''}</label>
        <div class="custom-switch" data-action="history-switch" data-id="${group.id}">
          <input type="checkbox" id="sw-${group.id}" class="sw-input" />
          <label for="sw-${group.id}" class="sw-slider"></label>
        </div>
      </div>`
  }

  return `
    <div class="vis-group-inner" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
      <div class="vis-group-label" style="display:flex; align-items:center;">
        ${checkboxHtml}
        <span class="group-text">${group.content}</span>
      </div>
      ${extraHtml}
    </div>
  `
}
