<template>
  <div
    :class="[
      'ui-select',
      `ui-select--${size}`,
      { 'ui-select--disabled': disabled },
      { 'ui-select--error': error },
      { 'ui-select--block': block },
      { 'ui-select--open': isOpen }
    ]"
    ref="selectRef"
  >
    <label v-if="label" class="ui-select__label" :for="id">
      {{ label }}
      <span v-if="required" class="ui-select__required">*</span>
    </label>
    
    <div
      class="ui-select__wrapper"
      @click="toggleDropdown"
      :tabindex="disabled ? -1 : 0"
      @keydown.esc="closeDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.down.prevent="highlightNextOption"
      @keydown.up.prevent="highlightPreviousOption"
    >
      <div class="ui-select__value">
        <slot name="selected-option" :selected="selectedOption">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </slot>
      </div>
      
      <div class="ui-select__arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    
    <div v-if="isOpen" class="ui-select__dropdown">
      <div
        v-for="(option, index) in options"
        :key="option.value"
        :class="[
          'ui-select__option',
          {
            'ui-select__option--selected': isOptionSelected(option),
            'ui-select__option--highlighted': highlightedIndex === index
          }
        ]"
        @click="selectOption(option)"
        @mouseover="highlightedIndex = index"
      >
        <slot name="option" :option="option" :selected="isOptionSelected(option)">
          {{ option.label }}
        </slot>
      </div>
      
      <div v-if="options.length === 0" class="ui-select__empty">
        {{ emptyText }}
      </div>
    </div>
    
    <div v-if="error" class="ui-select__error">
      {{ error }}
    </div>
    
    <div v-else-if="hint" class="ui-select__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

interface SelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export default defineComponent({
  name: 'UiSelect',
  
  props: {
    /**
     * Select model value
     */
    modelValue: {
      type: [String, Number, Array],
      default: ''
    },
    
    /**
     * Select options
     */
    options: {
      type: Array as () => SelectOption[],
      default: () => []
    },
    
    /**
     * Select label
     */
    label: {
      type: String,
      default: ''
    },
    
    /**
     * Select placeholder
     */
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    
    /**
     * Empty text when no options are available
     */
    emptyText: {
      type: String,
      default: 'No options available'
    },
    
    /**
     * Select ID
     */
    id: {
      type: String,
      default: () => `select-${Math.random().toString(36).substring(2, 9)}`
    },
    
    /**
     * Select size
     */
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => {
        return ['sm', 'md', 'lg'].includes(value);
      }
    },
    
    /**
     * Whether the select is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the select is required
     */
    required: {
      type: Boolean,
      default: false
    },
    
    /**
     * Error message
     */
    error: {
      type: String,
      default: ''
    },
    
    /**
     * Hint message
     */
    hint: {
      type: String,
      default: ''
    },
    
    /**
     * Whether the select should take up the full width of its container
     */
    block: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the select allows multiple selection
     */
    multiple: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  
  setup(props, { emit }) {
    const selectRef = ref<HTMLElement | null>(null);
    const isOpen = ref(false);
    const highlightedIndex = ref(0);
    
    /**
     * Get the selected option
     */
    const selectedOption = computed(() => {
      if (props.multiple) {
        return props.options.filter(option => 
          Array.isArray(props.modelValue) && props.modelValue.includes(option.value)
        );
      }
      
      return props.options.find(option => option.value === props.modelValue);
    });
    
    /**
     * Check if an option is selected
     * 
     * @param {SelectOption} option - Option to check
     * @returns {boolean} Whether the option is selected
     */
    function isOptionSelected(option: SelectOption): boolean {
      if (props.multiple) {
        return Array.isArray(props.modelValue) && props.modelValue.includes(option.value);
      }
      
      return option.value === props.modelValue;
    }
    
    /**
     * Toggle the dropdown
     */
    function toggleDropdown() {
      if (props.disabled) return;
      
      isOpen.value = !isOpen.value;
      
      if (isOpen.value) {
        emit('focus');
        
        // Find the index of the selected option
        const selectedIndex = props.options.findIndex(option => option.value === props.modelValue);
        highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
      } else {
        emit('blur');
      }
    }
    
    /**
     * Close the dropdown
     */
    function closeDropdown() {
      if (isOpen.value) {
        isOpen.value = false;
        emit('blur');
      }
    }
    
    /**
     * Select an option
     * 
     * @param {SelectOption} option - Option to select
     */
    function selectOption(option: SelectOption) {
      if (props.disabled) return;
      
      if (props.multiple) {
        const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        const index = values.indexOf(option.value);
        
        if (index === -1) {
          values.push(option.value);
        } else {
          values.splice(index, 1);
        }
        
        emit('update:modelValue', values);
        emit('change', values);
      } else {
        emit('update:modelValue', option.value);
        emit('change', option.value);
        closeDropdown();
      }
    }
    
    /**
     * Highlight the next option
     */
    function highlightNextOption() {
      if (props.options.length === 0) return;
      
      highlightedIndex.value = (highlightedIndex.value + 1) % props.options.length;
    }
    
    /**
     * Highlight the previous option
     */
    function highlightPreviousOption() {
      if (props.options.length === 0) return;
      
      highlightedIndex.value = (highlightedIndex.value - 1 + props.options.length) % props.options.length;
    }
    
    /**
     * Handle click outside
     * 
     * @param {MouseEvent} event - Mouse event
     */
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
        closeDropdown();
      }
    }
    
    // Add click outside listener
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    // Remove click outside listener
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    return {
      selectRef,
      isOpen,
      highlightedIndex,
      selectedOption,
      isOptionSelected,
      toggleDropdown,
      closeDropdown,
      selectOption,
      highlightNextOption,
      highlightPreviousOption
    };
  }
});
</script>

<style scoped>
.ui-select {
  display: flex;
  flex-direction: column;
  font-family: inherit;
  position: relative;
}

.ui-select--block {
  width: 100%;
}

.ui-select__label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #1E1E1E;
}

.ui-select__required {
  color: #EF4444;
  margin-left: 2px;
}

.ui-select__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.ui-select__wrapper:focus {
  border-color: #0C84FE;
  box-shadow: 0 0 0 3px rgba(12, 132, 254, 0.3);
  outline: none;
}

.ui-select--error .ui-select__wrapper {
  border-color: #EF4444;
}

.ui-select--error .ui-select__wrapper:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.ui-select--disabled .ui-select__wrapper {
  background-color: #F5F7FA;
  cursor: not-allowed;
}

.ui-select__value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1E1E1E;
}

.ui-select__value:empty::before {
  content: attr(data-placeholder);
  color: #6E7275;
}

.ui-select__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6E7275;
  transition: transform 0.2s ease;
}

.ui-select--open .ui-select__arrow {
  transform: rotate(180deg);
}

.ui-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.ui-select__option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ui-select__option:hover,
.ui-select__option--highlighted {
  background-color: #F5F7FA;
}

.ui-select__option--selected {
  background-color: rgba(12, 132, 254, 0.1);
  color: #0C84FE;
  font-weight: 500;
}

.ui-select__empty {
  padding: 8px 12px;
  color: #6E7275;
  text-align: center;
}

.ui-select__error {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}

.ui-select__hint {
  font-size: 12px;
  color: #6E7275;
  margin-top: 4px;
}

/* Sizes */
.ui-select--sm .ui-select__wrapper {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.ui-select--md .ui-select__wrapper {
  height: 40px;
  padding: 0 12px;
  font-size: 16px;
}

.ui-select--lg .ui-select__wrapper {
  height: 48px;
  padding: 0 16px;
  font-size: 16px;
}
</style>
