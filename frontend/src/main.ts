import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'

import './assets/tailwind.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { 
faUser, 
faEnvelope, 
faCircle, 
faCheck, 
faClock, 
faTimes, 
faSearch, 
faFileExport, 
faHome, 
faChartBar, 
faCog, 
faFilter, 
faPlus, 
faSignOutAlt, 
faBell, 
faShoppingCart, 
faChartLine, 
faFileAlt, 
faUserPlus, 
faShoppingBag, 
faChevronLeft, 
faBars,
faEye,
faEyeSlash,
faCircleNotch,
faTrashAlt,
faEdit,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faUser, 
  faEnvelope, 
  faCircle, 
  faCheck, 
  faClock, 
  faTimes, 
  faSearch, 
  faFileExport, 
  faHome, 
  faChartBar, 
  faCog, 
  faFilter, 
  faPlus, 
  faSignOutAlt, 
  faBell,
  faShoppingCart,
  faChartLine,
  faFileAlt,
  faUserPlus,
  faShoppingBag,
  faChevronLeft,
  faBars,
  faEye,
  faEyeSlash,
  faCircleNotch,
  faEdit,
  faTrashAlt
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app') 