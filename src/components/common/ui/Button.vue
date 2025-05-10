<template>
  <button
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--block': block },
      { 'ui-button--disabled': disabled },
      { 'ui-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="ui-button__loader">
      <span class="ui-button__loader-dot"></span>
      <span class="ui-button__loader-dot"></span>
      <span class="ui-button__loader-dot"></span>
    </span>
    <span v-if="$slots.icon" class="ui-button__icon">
      <slot name="icon"></slot>
    </span>
    <span v-if="$slots.default" class="ui-button__label">
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UiButton',
  
  props: {
    /**
     * Button variant
     */
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => {
        return ['primary', 'secondary', 'tertiary', 'danger', 'success', 'warning', 'info', 'text'].includes(value);
      }
    },
    
    /**
     * Button size
     */
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => {
        return ['sm', 'md', 'lg'].includes(value);
      }
    },
    
    /**
     * Button type
     */
    type: {
      type: String,
      default: 'button',
      validator: (value: string) => {
        return ['button', 'submit', 'reset'].includes(value);
      }
    },
    
    /**
     * Whether the button is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the button is in loading state
     */
    loading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the button should take up the full width of its container
     */
    block: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit }) {
    /**
     * Handle button click
     * 
     * @param {MouseEvent} event - Mouse event
     */
    function handleClick(event: MouseEvent) {
      if (props.disabled || props.loading) {
        event.preventDefault();
        return;
      }
      
      emit('click', event);
    }
    
    return {
      handleClick
    };
  }
});
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  position: relative;
  text-decoration: none;
  user-select: none;
}

.ui-button:focus {
  box-shadow: 0 0 0 3px rgba(12, 132, 254, 0.3);
}

.ui-button--block {
  display: flex;
  width: 100%;
}

.ui-button--disabled,
.ui-button--loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Sizes */
.ui-button--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.ui-button--md {
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
}

.ui-button--lg {
  height: 48px;
  padding: 0 20px;
  font-size: 18px;
}

/* Variants */
.ui-button--primary {
  background-color: #0C84FE;
  color: white;
}

.ui-button--primary:hover:not(:disabled) {
  background-color: #0A6CD0;
}

.ui-button--secondary {
  background-color: #05C2C9;
  color: white;
}

.ui-button--secondary:hover:not(:disabled) {
  background-color: #049FA5;
}

.ui-button--tertiary {
  background-color: #F5F7FA;
  color: #1E1E1E;
  border: 1px solid #E2E8F0;
}

.ui-button--tertiary:hover:not(:disabled) {
  background-color: #E2E8F0;
}

.ui-button--danger {
  background-color: #EF4444;
  color: white;
}

.ui-button--danger:hover:not(:disabled) {
  background-color: #DC2626;
}

.ui-button--success {
  background-color: #36B37E;
  color: white;
}

.ui-button--success:hover:not(:disabled) {
  background-color: #2E9D6A;
}

.ui-button--warning {
  background-color: #F59E0B;
  color: white;
}

.ui-button--warning:hover:not(:disabled) {
  background-color: #D97706;
}

.ui-button--info {
  background-color: #3B82F6;
  color: white;
}

.ui-button--info:hover:not(:disabled) {
  background-color: #2563EB;
}

.ui-button--text {
  background-color: transparent;
  color: #0C84FE;
  padding: 0;
}

.ui-button--text:hover:not(:disabled) {
  color: #0A6CD0;
  text-decoration: underline;
}

/* Icon and label spacing */
.ui-button__icon {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.ui-button__label {
  display: flex;
  align-items: center;
}

/* Loading animation */
.ui-button__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.ui-button__loader-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
  margin: 0 2px;
  animation: loader-dot 1s infinite ease-in-out;
}

.ui-button__loader-dot:nth-child(1) {
  animation-delay: 0s;
}

.ui-button__loader-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.ui-button__loader-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loader-dot {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
