import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RoadmapView from '@/pages/RoadmapView.vue'
import TimelinePage from '@/pages/TimelinePage.vue'
import TimelineExamplesPage from '@/pages/TimelineExamplesPage.vue'
import TimelineEnhancedPage from '@/pages/TimelineEnhancedPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelinePage,
    },
    {
      path: '/timeline-examples',
      name: 'timeline-examples',
      component: TimelineExamplesPage,
    },
    {
      path: '/timeline-enhanced',
      name: 'timeline-enhanced',
      component: TimelineEnhancedPage,
    },
    {
      path: '/roadmap',
      name: 'roadmap',
      component: RoadmapView,
    },
  ],
})

export default router
