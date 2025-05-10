<template>
  <div class="main-layout">
    <header class="main-layout__header" v-if="showHeader">
      <slot name="header">
        <div class="main-layout__header-content">
          <div class="main-layout__logo">
            <slot name="logo">
              <h1 class="main-layout__title">{{ title }}</h1>
            </slot>
          </div>
          
          <div class="main-layout__actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </slot>
    </header>
    
    <div class="main-layout__container">
      <aside class="main-layout__sidebar" v-if="showSidebar">
        <slot name="sidebar"></slot>
      </aside>
      
      <main class="main-layout__content">
        <slot></slot>
      </main>
    </div>
    
    <footer class="main-layout__footer" v-if="showFooter">
      <slot name="footer">
        <div class="main-layout__footer-content">
          <p class="main-layout__copyright">{{ copyright }}</p>
        </div>
      </slot>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',
  
  props: {
    /**
     * Application title
     */
    title: {
      type: String,
      default: 'Proposal Builder'
    },
    
    /**
     * Copyright text
     */
    copyright: {
      type: String,
      default: '© 2023 Proposal Builder'
    },
    
    /**
     * Whether to show the header
     */
    showHeader: {
      type: Boolean,
      default: true
    },
    
    /**
     * Whether to show the sidebar
     */
    showSidebar: {
      type: Boolean,
      default: true
    },
    
    /**
     * Whether to show the footer
     */
    showFooter: {
      type: Boolean,
      default: true
    }
  }
});
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F7FA;
}

.main-layout__header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.main-layout__header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.main-layout__logo {
  display: flex;
  align-items: center;
}

.main-layout__title {
  font-size: 20px;
  font-weight: 600;
  color: #1E1E1E;
  margin: 0;
}

.main-layout__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-layout__container {
  display: flex;
  flex: 1;
}

.main-layout__sidebar {
  width: 240px;
  background-color: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  overflow-y: auto;
}

.main-layout__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.main-layout__footer {
  background-color: #FFFFFF;
  border-top: 1px solid #E2E8F0;
}

.main-layout__footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
}

.main-layout__copyright {
  font-size: 14px;
  color: #6E7275;
  margin: 0;
}

@media (max-width: 768px) {
  .main-layout__sidebar {
    width: 200px;
  }
  
  .main-layout__content {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .main-layout__header-content {
    height: 56px;
    padding: 0 16px;
  }
  
  .main-layout__sidebar {
    width: 100%;
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 0;
    z-index: 5;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-layout__sidebar--open {
    transform: translateX(0);
  }
  
  .main-layout__content {
    padding: 12px;
  }
}
</style>
