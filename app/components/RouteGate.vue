<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionLabel: { type: String, required: true },
  to: { type: String, required: true },
})
</script>

<template>
  <main class="route-gate">
    <div class="route-gate__moon" aria-hidden="true">☾</div>
    <section class="route-gate__card" aria-labelledby="route-gate-title">
      <p>LOCKED STAGE / 01</p>
      <span aria-hidden="true">✦</span>
      <h1 id="route-gate-title">{{ title }}</h1>
      <p class="route-gate__copy">{{ description }}</p>
      <NuxtLink :to="to" class="route-gate__action">{{ actionLabel }} <b aria-hidden="true">↗</b></NuxtLink>
    </section>
  </main>
</template>
