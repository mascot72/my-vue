<script setup lang="ts">
import { ref } from 'vue'
import BasicUsageExample from '@/domains/timeline/examples/BasicUsageExample.vue'
import SetSelectionExample from '@/domains/timeline/examples/interaction/SetSelectionExample.vue'
import EventListenersExample from '@/domains/timeline/examples/interaction/EventListenersExample.vue'
import ClickToUseExample from '@/domains/timeline/examples/interaction/ClickToUseExample.vue'
import AnimateWindowExample from '@/domains/timeline/examples/interaction/AnimateWindowExample.vue'
import NavigationMenuExample from '@/domains/timeline/examples/interaction/NavigationMenuExample.vue'
import PointItemsExample from '@/domains/timeline/examples/items/PointItemsExample.vue'
import BackgroundAreasExample from '@/domains/timeline/examples/items/BackgroundAreasExample.vue'
import HtmlContentsExample from '@/domains/timeline/examples/items/HtmlContentsExample.vue'
import TooltipExample from '@/domains/timeline/examples/items/TooltipExample.vue'
import GroupsExample from '@/domains/timeline/examples/groups/GroupsExample.vue'
import ApiProjectExample from '@/domains/timeline/examples/api/ApiProjectExample.vue'

interface Example {
  id: string
  category: string
  name: string
  description: string
  component: any
}

const examples: Example[] = [
  {
    id: 'basic',
    category: 'Basic',
    name: 'Basic Usage',
    description: '기본 타임라인 사용법',
    component: BasicUsageExample,
  },
  // Interaction
  {
    id: 'setSelection',
    category: 'Interaction',
    name: 'Set Selection',
    description: '아이템 선택 제어',
    component: SetSelectionExample,
  },
  {
    id: 'eventListeners',
    category: 'Interaction',
    name: 'Event Listeners',
    description: '이벤트 리스너 등록 및 처리',
    component: EventListenersExample,
  },
  {
    id: 'clickToUse',
    category: 'Interaction',
    name: 'Click To Use',
    description: '클릭으로 활성화/비활성화',
    component: ClickToUseExample,
  },
  {
    id: 'animateWindow',
    category: 'Interaction',
    name: 'Animate Window',
    description: '윈도우 애니메이션',
    component: AnimateWindowExample,
  },
  {
    id: 'navigationMenu',
    category: 'Interaction',
    name: 'Navigation Menu',
    description: '네비게이션 메뉴 제어',
    component: NavigationMenuExample,
  },
  // Items
  {
    id: 'pointItems',
    category: 'Items',
    name: 'Point Items',
    description: '포인트 아이템',
    component: PointItemsExample,
  },
  {
    id: 'backgroundAreas',
    category: 'Items',
    name: 'Background Areas',
    description: '배경 영역 아이템',
    component: BackgroundAreasExample,
  },
  {
    id: 'htmlContents',
    category: 'Items',
    name: 'HTML Contents',
    description: 'HTML 콘텐츠가 포함된 아이템',
    component: HtmlContentsExample,
  },
  {
    id: 'tooltip',
    category: 'Items',
    name: 'Tooltip',
    description: '툴팁 표시',
    component: TooltipExample,
  },
  // Groups
  {
    id: 'groups',
    category: 'Groups',
    name: 'Groups',
    description: '그룹으로 아이템 정렬',
    component: GroupsExample,
  },
  // API Integration
  {
    id: 'apiProject',
    category: 'Advanced',
    name: 'API Project Management',
    description: 'API 데이터로 프로젝트 관리 시스템',
    component: ApiProjectExample,
  },
]

const selectedExample = ref<Example>(examples[0])

const categories = Array.from(new Set(examples.map((e) => e.category)))

const getExamplesByCategory = (category: string) => {
  return examples.filter((e) => e.category === category)
}
</script>

<template>
  <div class="timeline-examples">
    <!-- 좌측 네비게이션 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Timeline Examples</h2>
      </div>

      <div class="examples-list">
        <div v-for="category in categories" :key="category" class="category">
          <h3 class="category-title">{{ category }}</h3>
          <div class="examples-group">
            <button
              v-for="example in getExamplesByCategory(category)"
              :key="example.id"
              :class="['example-btn', { active: selectedExample.id === example.id }]"
              @click="selectedExample = example"
            >
              <div class="example-title">{{ example.name }}</div>
              <div class="example-desc">{{ example.description }}</div>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 우측 콘텐츠 -->
    <main class="content">
      <div class="content-header">
        <h1>{{ selectedExample.name }}</h1>
        <p class="description">{{ selectedExample.description }}</p>
      </div>

      <div class="content-body">
        <component :is="selectedExample.component" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="css">
.timeline-examples {
  display: flex;
  height: 100vh;
  gap: 0;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.examples-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.category {
  margin-bottom: 20px;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  padding: 0 12px;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.examples-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.example-btn {
  all: unset;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  border: 1px solid transparent;

  &:hover {
    background: #e5e7eb;
  }

  &.active {
    background: white;
    border: 1px solid #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.example-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.example-desc {
  font-size: 12px;
  color: #6b7280;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.content-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.content-body {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
