<template>
  <div class="app-logo d-inline-flex align-items-center user-select-none" :class="[sizeClass]">
    <!-- Ticket Icon in Strong Blue -->
    <div class="logo-icon-wrapper" :style="{ width: iconSize + 'px', height: iconSize + 'px' }">
      <svg
        viewBox="0 0 64 64"
        class="w-100 h-100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="'otGrad_' + id" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1d4ed8" />
            <stop offset="60%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#1e40af" />
          </linearGradient>
          <filter :id="'otShadow_' + id" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1e40af" flood-opacity="0.3" />
          </filter>
        </defs>

        <g :filter="'url(#otShadow_' + id + ')'">
          <!-- Ticket Shape with Side Cutout Notches -->
          <path
            d="
              M 10 6
              L 54 6
              A 6 6 0 0 1 60 12
              L 60 25
              A 7 7 0 0 0 60 39
              L 60 52
              A 6 6 0 0 1 54 58
              L 10 58
              A 6 6 0 0 1 4 52
              L 4 39
              A 7 7 0 0 0 4 25
              L 4 12
              A 6 6 0 0 1 10 6
              Z
            "
            :fill="'url(#otGrad_' + id + ')'"
          />

          <!-- Perforation Line -->
          <line
            x1="22"
            y1="11"
            x2="22"
            y2="53"
            stroke="#ffffff"
            stroke-width="2"
            stroke-dasharray="3 3"
            opacity="0.65"
          />

          <!-- Ticket Stub Dot -->
          <circle cx="13" cy="32" r="3" fill="#ffffff" opacity="0.85" />

          <!-- Open Source Brackets Symbol (< / >) -->
          <path
            d="M 34 23 L 28 32 L 34 41"
            stroke="#ffffff"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M 48 23 L 54 32 L 48 41"
            stroke="#ffffff"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="43"
            y1="22"
            x2="39"
            y2="42"
            stroke="#93c5fd"
            stroke-width="2.4"
            stroke-linecap="round"
          />
        </g>
      </svg>
    </div>

    <!-- Wordmark -->
    <div v-if="variant === 'full'" class="ms-2 d-flex flex-column text-start">
      <span class="brand-text lh-1" :class="textColorClass">
        <span class="fw-bold tracking-tight">open</span><span class="fw-black text-brand-blue">-ticket</span>
      </span>
      <span v-if="showSubtitle" class="brand-subtitle text-uppercase" :class="subtitleColorClass">
        Open Source Helpdesk
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppLogo",
  props: {
    size: {
      type: String,
      default: "md", // 'sm', 'md', 'lg', 'xl'
    },
    variant: {
      type: String,
      default: "full", // 'full', 'icon'
    },
    theme: {
      type: String,
      default: "dark", // 'dark' (for white text in dark navbar), 'light' (for dark text on white/light background)
    },
    showSubtitle: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: Math.random().toString(36).substring(2, 7),
    };
  },
  computed: {
    iconSize() {
      switch (this.size) {
        case "sm":
          return 32;
        case "lg":
          return 56;
        case "xl":
          return 72;
        case "md":
        default:
          return 42;
      }
    },
    sizeClass() {
      return `logo-${this.size}`;
    },
    textColorClass() {
      return this.theme === "dark" ? "text-white" : "text-slate-900";
    },
    subtitleColorClass() {
      return this.theme === "dark" ? "text-white-50" : "text-muted";
    },
  },
};
</script>

<style scoped>
.app-logo {
  transition: transform 0.2s ease;
  line-height: 1;
}

.logo-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.03em;
}

.logo-sm .brand-text {
  font-size: 1.15rem;
}

.logo-md .brand-text {
  font-size: 1.4rem;
}

.logo-lg .brand-text {
  font-size: 2rem;
}

.logo-xl .brand-text {
  font-size: 2.5rem;
}

.text-brand-blue {
  color: #2563eb !important;
}

.brand-subtitle {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  font-weight: 700;
  margin-top: 3px;
}

.text-slate-900 {
  color: #0f172a;
}
</style>
