// templates.js
const DELEGATE_CLASS = "com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate";

/** 아이템(막대) 템플릿 */
export const itemTemplate = (data, timelineState) => {
  const writingClass = data.writingStatus === 'code001' ? 'lock' : (data.writingStatus === 'code002' ? 'unlock' : '');
  const isActive = timelineState.activeArrowItemIds.includes(String(data.id));

  const titleHtml = data.ptrmType === 'PRM'
    ? `<div class="vis-item-title">${data.title || ''}</div>`
    : `<div class="vis-item-title">${data.technologyClassLv3Name || 'N/A'} > ${data.title || ''}</div>`;

  let imageWrapHtml = '';
  if (data.ptrmType === 'PRM') {
    const imgSrc = `https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${data.id}&sectionType=-&ownerDelegateClass=${DELEGATE_CLASS}&createDate=${data.updateDate}`;
    const addButtonHtml = data.hasTrm
      ? `<div class="vis-item-add ${isActive ? 'active' : ''}" data-action="add-item" data-id="${data.id}">${isActive ? "-" : "+"}</div>`
      : '';

    imageWrapHtml = `
      <div class="vis-item-imgwrap">
        <img class="vis-item-img" src="${imgSrc}" loading="lazy" />
        ${addButtonHtml}
      </div>`;
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
  `;
};

/** 그룹(왼쪽 레이블) 템플릿 */
export const groupTemplate = (group, isChecked, msg) => {
  const showCheckbox = !group.isOrganization && !group.isSubgroup;
  const checkboxHtml = showCheckbox
    ? `<input type="checkbox" class="vis-group-check" data-id="${group.id}" ${isChecked ? 'checked' : ''} />`
    : '';

  let extraHtml = '';
  if (group.isOrganization) {
    extraHtml = `
      <div class="vis-group-extra" @click.stop>
        <label class="msg-label">${msg || ''}</label>
        <div class="custom-switch" data-action="history-switch" data-id="${group.id}">
          <input type="checkbox" id="sw-${group.id}" class="sw-input" />
          <label for="sw-${group.id}" class="sw-slider"></label>
        </div>
      </div>`;
  }

  return `
    <div class="vis-group-inner" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
      <div class="vis-group-label" style="display:flex; align-items:center;">
        ${checkboxHtml}
        <span class="group-text">${group.content}</span>
      </div>
      ${extraHtml}
    </div>
  `;
};
