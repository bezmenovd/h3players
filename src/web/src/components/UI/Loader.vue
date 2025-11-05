<template>
  <div class="loader-wrapper" v-if="visible">
      <div class="loader"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(true)

// setTimeout(() => visible.value = true, 400)

</script>

<style scoped>
.loader-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    /* background: #272c3a; */
    background: transparent;
}
.loader {
  width: 40px;
  height: 40px;
  display: grid;
  color: #444a66;
}
.loader:before,
.loader:after {
  content: "";
  grid-area: 1/1;
  --c:#0000 calc(100%/3),#444a66 0 calc(2*100%/3),#0000 0;
  --c1:linear-gradient(90deg,var(--c));
  --c2:linear-gradient( 0deg,var(--c));
  background: var(--c1),var(--c2),var(--c1),var(--c2);
  background-size: 300% 4px,4px 300%;
  background-repeat: no-repeat;
  animation: l15 2s linear infinite;
}
.loader:after {
  animation-delay: -1s;
}
@keyframes l15 {
  0%   {background-position: 50%  0,100% 100%,0    100%,0 0}
  25%  {background-position: 0    0,100% 50% ,0    100%,0 0}
  50%  {background-position: 0    0,100% 0   ,50%  100%,0 0}
  75%  {background-position: 0    0,100% 0   ,100% 100%,0 50%}
 75.01%{background-position: 100% 0,100% 0   ,100% 100%,0 50%}
  100% {background-position: 50%  0,100% 0   ,100% 100%,0 100%}
}
</style>
