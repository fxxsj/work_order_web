import type { RouteRecordRaw } from 'vue-router'

const ArtworkList = () => import('@/views/artwork/ArtworkList.vue')
const DieList = () => import('@/views/die/DieList.vue')
const FoilingPlateList = () => import('@/views/foiling-plate/FoilingPlateList.vue')
const EmbossingPlateList = () => import('@/views/embossing-plate/EmbossingPlateList.vue')

export const plateRoutes: RouteRecordRaw[] = [
  {
    path: 'artworks',
    name: 'ArtworkList',
    component: ArtworkList,
    meta: { title: '图稿管理', requiresAuth: true, requiresPermission: ['workorder.view_artwork'] }
  },
  {
    path: 'dies',
    name: 'DieList',
    component: DieList,
    meta: { title: '刀模管理', requiresAuth: true, requiresPermission: ['workorder.view_die'] }
  },
  {
    path: 'foiling-plates',
    name: 'FoilingPlateList',
    component: FoilingPlateList,
    meta: { title: '烫金版管理', requiresAuth: true, requiresPermission: ['workorder.view_foilingplate'] }
  },
  {
    path: 'embossing-plates',
    name: 'EmbossingPlateList',
    component: EmbossingPlateList,
    meta: { title: '压凸版管理', requiresAuth: true, requiresPermission: ['workorder.view_embossingplate'] }
  }
]
