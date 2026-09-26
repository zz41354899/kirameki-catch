<script setup>
defineProps({ name: String })
</script>
<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <template v-if="name === 'star'"><path d="m32 5 8 17 19 3-14 14 3 20-16-9-17 9 3-20L4 25l20-3z" fill="currentColor" stroke="#7b514b" stroke-width="2.4" stroke-linejoin="round"/><path d="m25 23 5-10" stroke="white" stroke-width="3" stroke-linecap="round"/></template>
    <template v-else-if="name === 'candy'"><path d="m9 17 17 7-9 19L4 35l8-6zM55 21l-17 4 8 19 14-8-9-5z" fill="#f7a8c2" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><rect x="19" y="18" width="28" height="29" rx="11" fill="#fff6e9" stroke="currentColor" stroke-width="2.5" transform="rotate(-20 33 33)"/><path d="m25 22 13 24m-5-25 10 19" stroke="#ee608e" stroke-width="6"/></template>
    <template v-else-if="name === 'cloud'"><path d="M16 42C2 41 6 24 17 25c-2-20 28-22 31-4 17-2 18 21 3 21z" fill="#c2b6db" stroke="currentColor" stroke-width="2.5"/><path d="m25 46-4 8m20-8-4 8m-14-23 6 2m9 0 6-2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></template>
    <template v-else-if="name === 'bow'"><path d="M28 29C3 3 2 17 8 41c3 7 12 0 20-5M36 29C61 3 62 17 56 41c-3 7-12 0-20-5" fill="currentColor"/><rect x="26" y="24" width="12" height="17" rx="5" fill="currentColor"/><path d="m27 37-9 20 11-4 3-14m5-2 9 20-11-4-3-14" fill="currentColor"/></template>
    <template v-else-if="name === 'sound'"><path d="M10 25h11l14-12v38L21 39H10z" fill="currentColor"/><path d="M44 22q13 10 0 20m7-28q21 18 0 36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></template>
    <template v-else-if="name === 'mute'"><path d="M10 25h11l14-12v38L21 39H10z" fill="currentColor"/><path d="m44 24 14 16m0-16L44 40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></template>
    <template v-else-if="name === 'arrow'"><path d="M10 32h43M36 16l17 16-17 16" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></template>
    <template v-else-if="name === 'heart'"><path d="M32 55S6 40 6 22C6 7 25 7 32 20 39 7 58 7 58 22c0 18-26 33-26 33" fill="currentColor"/></template>
    <template v-else-if="name === 'cup'"><path d="M19 9h27v18c0 20-27 20-27 0z" fill="#ffcc63" stroke="currentColor" stroke-width="3"/><path d="M19 15H8v10q0 13 14 11M46 15h10v10q0 13-13 11M32 42v11M22 55h20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></template>
  </svg>
</template>
