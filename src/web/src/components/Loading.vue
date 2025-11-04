<template>
    <div id="loading">
        <div class="loader"></div>
    </div>
</template>

<script setup>


</script>

<style scoped>
#loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    background: #272c3a;
}
.loader {
  width: 35px;
  aspect-ratio: 1;
  --c1:linear-gradient(90deg,#0000 calc(100%/3),#888888 0 calc(2*100%/3),#0000 0);
  --c2:linear-gradient( 0deg,#0000 calc(100%/3),#888888 0 calc(2*100%/3),#0000 0);
  background: var(--c1),var(--c2),var(--c1),var(--c2);
  background-size: 300% 4px,4px 300%;
  background-repeat: no-repeat;
  animation: l3 1s infinite linear;
}
@keyframes l3 {
  0%   {background-position: 50%  0,100% 100%,0    100%,0 0}
  25%  {background-position: 0    0,100% 50% ,0    100%,0 0}
  50%  {background-position: 0    0,100% 0   ,50%  100%,0 0}
  75%  {background-position: 0    0,100% 0   ,100% 100%,0 50%}
 75.01%{background-position: 100% 0,100% 0   ,100% 100%,0 50%}
  100% {background-position: 50%  0,100% 0   ,100% 100%,0 100%}
}
</style>
