import { computed, type Ref } from 'vue'
import type { ItemCard } from '../types/item.types'
import type { TimelineItem } from '../types'

/**
 * 날짜 범위를 포맷팅
 */
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  
  return `${startDate.toLocaleDateString('ko-KR', options)} - ${endDate.toLocaleDateString('ko-KR', options)}`
}

/**
 * ItemCard를 Timeline Item으로 변환
 */
export function useItemsTimeline(items: Ref<ItemCard[]>) {
  const timelineItems = computed<TimelineItem[]>(() => {
    return items.value.map((item, index) => {
      const tags = item.tags.slice(0, 3).map(tag => `<span class="timeline-tag">#${tag}</span>`).join('')
      const thumbnail = item.imageUrl 
        ? `<div class="timeline-thumbnail" style="background-image: url('${item.imageUrl}');"></div>`
        : `<div class="timeline-thumbnail timeline-thumbnail-placeholder">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
               <circle cx="8.5" cy="8.5" r="1.5"/>
               <polyline points="21 15 16 10 5 21"/>
             </svg>
           </div>`
      
      return {
        id: index + 1,
        content: `<div class="timeline-card" data-item-id="${item.id}">
          ${thumbnail}
          <div class="timeline-card-content">
            <div class="timeline-card-header">
              <h4 class="timeline-card-title" title="${item.title}">${item.title}</h4>
              <div class="timeline-card-meta">
                <span class="timeline-status timeline-status-${item.status}">${item.status}</span>
                <span class="timeline-priority timeline-priority-${item.priority}">${item.priority}</span>
              </div>
            </div>
            <p class="timeline-card-description" title="${item.description}">${item.description}</p>
            ${tags ? `<div class="timeline-card-tags">${tags}</div>` : ''}
            <div class="timeline-card-footer">
              <span class="timeline-date">${formatDateRange(item.start, item.end)}</span>
            </div>
          </div>
        </div>`,
        start: item.start,
        end: item.end,
        title: `${item.title}\n${item.description}`,
        className: `timeline-item-${item.status} priority-${item.priority}`,
        type: 'range',
      }
    })
  })

  return {
    timelineItems,
  }
}
