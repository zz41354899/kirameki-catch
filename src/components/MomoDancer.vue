<script setup>
defineProps({ pose: { type: String, default: 'idle' }, rig: { type: Object, default: () => ({}) } })
</script>

<template>
  <svg class="momo-dancer" :class="`pose-${pose}`" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse class="dance-shadow" cx="160" cy="379" rx="74" ry="12" fill="#29345c" opacity=".13"/>
    <g class="momo-body" :transform="`translate(${rig.x || 0} ${rig.y || 0}) rotate(${rig.body || 0} 160 350)`" stroke="#30385d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <g class="momo-tail tail-left" :transform="`rotate(${rig.leftTail || 0} 91 112)`"><path d="M94 100C40 93 38 160 51 199C60 229 38 237 39 237C95 254 116 204 96 164Z" fill="#ffc3d7"/><path d="M70 132Q54 184 72 211" stroke="#e77aab"/><path d="m66 105-22-19 2 38 22-5 15 20 9-37Z" fill="#f94a8e"/></g>
      <g class="momo-tail tail-right" :transform="`rotate(${rig.rightTail || 0} 229 112)`"><path d="M226 100C280 93 282 160 269 199C260 229 282 237 281 237C225 254 204 204 224 164Z" fill="#ffc3d7"/><path d="M250 132Q266 184 248 211" stroke="#e77aab"/><path d="m254 105 22-19-2 38-22-5-15 20-9-37Z" fill="#f94a8e"/></g>
      <g class="momo-leg leg-left" :transform="`rotate(${rig.leftLeg || 0} 143 301)`"><path d="m129 302-2 54 24 1 5-56" fill="#fffdf4"/><path d="m127 342 26 1M132 350l17 1" stroke="#f899b7"/><path d="M128 351c-6 1-16 11-14 18h41l-2-17Z" fill="#30385d"/><path d="m126 360 14 0" stroke="#fffdf4"/></g>
      <g class="momo-leg leg-right" :transform="`rotate(${rig.rightLeg || 0} 178 301)`"><path d="m165 301 5 56 24-1-2-54" fill="#fffdf4"/><path d="m168 343 26-1M174 351l15-1" stroke="#f899b7"/><path d="M192 351c6 1 16 11 14 18h-41l2-17Z" fill="#30385d"/><path d="m180 360 14 0" stroke="#fffdf4"/></g>
      <g class="momo-dress"><path d="m132 201-11 57-23 49q62 25 124 0l-23-49-11-57Z" fill="#ff78ac"/><path d="m129 260-19 41q50 17 100 0l-19-41" fill="#fffdf6"/><path d="M102 302q7 22 17 8 10 19 20 4 12 17 22 2 11 15 20-2 12 15 21-4 11 13 17-8" fill="#fffdf6"/><path d="m130 209 29 30 31-30-16-10h-30Z" fill="#30385d"/><path d="m146 203 14 19 14-19" fill="#fffdf6"/><path d="m159 233-20-8v21l21-7 19 7v-21Z" fill="#ffe472"/><circle cx="160" cy="236" r="5" fill="#f94a8e"/><path d="m119 260 82 0" stroke="#30385d"/><path d="m145 277 15 9 15-9" stroke="#f899b7"/></g>
      <g class="momo-arm arm-left" :transform="`rotate(${rig.leftArm || 0} 126 217)`"><path d="M128 209Q102 204 93 226l-16 25q-9 0-13 8c-7 13 11 22 20 11l28-29 24-12Z" fill="#fff0df"/><path d="M127 207q-22-5-31 16l18 17 22-12Z" fill="#fffdf6"/><path d="m99 226 13 11" stroke="#fa8fb5"/></g>
      <g class="momo-arm arm-right" :transform="`rotate(${rig.rightArm || 0} 194 217)`"><path d="M192 209q26-5 35 17l16 25q9 0 13 8c7 13-11 22-20 11l-28-29-24-12Z" fill="#fff0df"/><path d="M193 207q22-5 31 16l-18 17-22-12Z" fill="#fffdf6"/><path d="m221 226-13 11" stroke="#fa8fb5"/></g>
      <g class="momo-head" :transform="`rotate(${rig.head || 0} 160 191)`">
        <path d="M86 133C75 53 123 31 160 32c51-1 83 39 75 101l-10 41H96Z" fill="#ffc3d7"/>
        <ellipse cx="92" cy="149" rx="11" ry="16" fill="#fff0df"/><ellipse cx="228" cy="149" rx="11" ry="16" fill="#fff0df"/>
        <path d="M95 116c-1 48 6 79 65 84 59-5 66-36 65-84l-63-49Z" fill="#fff0df"/>
        <path d="M90 127q-4-57 52-67 61-5 88 63l-35-7-15-35-1 36-27-11-11-29-5 37-25 9 1-29Z" fill="#ffc3d7"/>
        <path d="M108 62q47-29 104 1l-4-18-15-1-9-12-16 5-16-9-14 10-18-1Z" fill="#fffdf6"/>
        <path d="m111 135 23-2m53 0 23 2" stroke="#aa6488" stroke-width="3"/>
        <ellipse cx="124" cy="151" rx="10" ry="16" fill="#a13b75"/><ellipse cx="196" cy="151" rx="10" ry="16" fill="#a13b75"/>
        <ellipse cx="126" cy="146" rx="3" ry="5" fill="white" stroke="none"/><ellipse cx="198" cy="146" rx="3" ry="5" fill="white" stroke="none"/>
        <path d="m112 140-5-4m89 3 9-3"/>
        <ellipse cx="109" cy="174" rx="13" ry="6" fill="#ffa2b8" opacity=".7" stroke="none"/><ellipse cx="211" cy="174" rx="13" ry="6" fill="#ffa2b8" opacity=".7" stroke="none"/>
        <path d="M149 177q11 16 22 0" fill="#f480a1"/>
        <path d="m211 73 5-12 5 12 12 5-12 5-5 12-5-12-12-5Z" fill="#ffe472"/>
      </g>
    </g>
  </svg>
</template>
