<template>
  <div
    :class="[
      'ui-input',
      `ui-input--${size}`,
      { 'ui-input--disabled': disabled },
      { 'ui-input--error': error },
      { 'ui-input--block': block }
    ]"
  >
    <label v-if="label" class="ui-input__label" :for="id">
      {{ label }}
      <span v-if="required" class="ui-input__required">*</span>
    </label>
    
    <div class="ui-input__wrapper">
      <div v-if="$slots.prefix" class="ui-input__prefix">
        <slot name="prefix"></slot>
      </div>
      
      <input
        :id="id"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        :pattern="pattern"
        class="ui-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      
      <div v-if="$slots.suffix" class="ui-input__suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    
    <div v-if="error" class="ui-input__error">
      {{ error }}
    </div>
    
    <div v-else-if="hint" class="ui-input__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'UiInput',
  
  props: {
    /**
     * Input model value
     */
    modelValue: {
      type: [String, Number],
      default: ''
    },
    
    /**
     * Input type
     */
    type: {
      type: String,
      default: 'text',
      validator: (value: string) => {
        return [
          'text',
          'password',
          'email',
          'number',
          'tel',
          'url',
          'search',
          'date',
          'time',
          'datetime-local',
          'month',
          'week',
          'color'
        ].includes(value);
      }
    },
    
    /**
     * Input label
     */
    label: {
      type: String,
      default: ''
    },
    
    /**
     * Input placeholder
     */
    placeholder: {
      type: String,
      default: ''
    },
    
    /**
     * Input ID
     */
    id: {
      type: String,
      default: () => `input-${Math.random().toString(36).substring(2, 9)}`
    },
    
    /**
     * Input size
     */
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => {
        return ['sm', 'md', 'lg'].includes(value);
      }
    },
    
    /**
     * Whether the input is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the input is readonly
     */
    readonly: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the input is required
     */
    required: {
      type: Boolean,
      default: false
    },
    
    /**
     * Input autocomplete attribute
     */
    autocomplete: {
      type: String,
      default: 'off'
    },
    
    /**
     * Input min attribute (for number, date, etc.)
     */
    min: {
      type: [String, Number],
      default: undefined
    },
    
    /**
     * Input max attribute (for number, date, etc.)
     */
    max: {
      type: [String, Number],
      default: undefined
    },
    
    /**
     * Input step attribute (for number, date, etc.)
     */
    step: {
      type: [String, Number],
      default: undefined
    },
    
    /**
     * Input maxlength attribute
     */
    maxlength: {
      type: [String, Number],
      default: undefined
    },
    
    /**
     * Input pattern attribute
     */
    pattern: {
      type: String,
      default: undefined
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
     * Whether the input should take up the full width of its container
     */
    block: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'focus', 'blur', 'change', 'keydown'],
  
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    
    /**
     * Handle input event
     * 
     * @param {Event} event - Input event
     */
    function handleInput(event: Event) {
      const target = event.target as HTMLInputElement;
      emit('update:modelValue', target.value);
    }
    
    /**
     * Handle focus event
     * 
     * @param {FocusEvent} event - Focus event
     */
    function handleFocus(event: FocusEvent) {
      emit('focus', event);
    }
    
    /**
     * Handle blur event
     * 
     * @param {FocusEvent} event - Blur event
     */
    function handleBlur(event: FocusEvent) {
      emit('blur', event);
    }
    
    /**
     * Handle change event
     * 
     * @param {Event} event - Change event
     */
    function handleChange(event: Event) {
      emit('change', event);
    }
    
    /**
     * Handle keydown event
     * 
     * @param {KeyboardEvent} event - Keydown event
     */
    function handleKeydown(event: KeyboardEvent) {
      emit('keydown', event);
    }
    
    /**
     * Focus the input
     */
    function focus() {
      inputRef.value?.focus();
    }
    
    /**
     * Blur the input
     */
    function blur() {
      inputRef.value?.blur();
    }
    
    /**
     * Select all text in the input
     */
    function select() {
      inputRef.value?.select();
    }
    
    return {
      inputRef,
      handleInput,
      handleFocus,
      handleBlur,
      handleChange,
      handleKeydown,
      focus,
      blur,
      select
    };
  }
});
</script>

<style scoped>
.ui-input {
  display: flex;
  flex-direction: column;
  font-family: inherit;
}

.ui-input--block {
  width: 100%;
}

.ui-input__label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #1E1E1E;
}

.ui-input__required {
  color: #EF4444;
  margin-left: 2px;
}

.ui-input__wrapper {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.ui-input__wrapper:focus-within {
  border-color: #0C84FE;
  box-shadow: 0 0 0 3px rgba(12, 132, 254, 0.3);
}

.ui-input--error .ui-input__wrapper {
  border-color: #EF4444;
}

.ui-input--error .ui-input__wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.ui-input--disabled .ui-input__wrapper {
  background-color: #F5F7FA;
  cursor: not-allowed;
}

.ui-input__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  width: 100%;
}

.ui-input__field:disabled {
  cursor: not-allowed;
}

.ui-input__prefix,
.ui-input__suffix {
  display: flex;
  align-items: center;
  color: #6E7275;
}

.ui-input__prefix {
  margin-left: 12px;
  margin-right: 8px;
}

.ui-input__suffix {
  margin-right: 12px;
  margin-left: 8px;
}

.ui-input__error {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}

.ui-input__hint {
  font-size: 12px;
  color: #6E7275;
  margin-top: 4px;
}

/* Sizes */
.ui-input--sm .ui-input__wrapper {
  height: 32px;
}

.ui-input--sm .ui-input__field {
  font-size: 14px;
  padding: 0 12px;
}

.ui-input--md .ui-input__wrapper {
  height: 40px;
}

.ui-input--md .ui-input__field {
  font-size: 16px;
  padding: 0 12px;
}

.ui-input--lg .ui-input__wrapper {
  height: 48px;
}

.ui-input--lg .ui-input__field {
  font-size: 16px;
  padding: 0 16px;
}
</style>
