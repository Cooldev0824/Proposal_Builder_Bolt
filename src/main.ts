import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import App from "./App.vue";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";

// Routes
import routes from "./router";

// Global styles
import "./assets/styles/main.scss";

// Initialize selection tracking
import { initSelectionTracking } from "./utils/selectionManager";

// Load Google Fonts using the font loader utility
import { loadGoogleFonts } from "./utils/fontLoader";
loadGoogleFonts();

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#0C84FE",
          secondary: "#05C2C9",
          accent: "#8A8D93",
          success: "#36B37E",
          warning: "#F59E0B",
          error: "#EF4444",
          "on-surface": "#1E1E1E",
        },
      },
    },
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();

// Initialize selection tracking
initSelectionTracking();

// Import common components
import { registerUIComponents } from "./components/common/ui";
import { registerLayoutComponents } from "./components/common/layout";
import { registerElementComponents } from "./components/common/elements";

const app = createApp(App);

// Register common components
registerUIComponents(app);
registerLayoutComponents(app);
registerElementComponents(app);

// Use plugins
app.use(router).use(vuetify).use(pinia);

// Mount the app
app.mount("#app");
