import { createApp } from 'vue';
import { createPinia } from 'pinia';
import createVuetify from './vuetify';

import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(createVuetify);

app.mount('#app');