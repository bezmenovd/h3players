<template>
    <div class="pulse-container">
        <div class="pulse-ringring"></div>
        <div class="pulse-circle"></div>
    </div>
</template>

<style>
.pulse-container {
    position: relative;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 4px;
}

.pulse-circle {
    width: 8px;
    height: 8px;
    background-color: #19f0af;
    border-radius: 50%;
}

.pulse-ringring {
    border: 3px solid #19f0af;
    -webkit-border-radius: 30px;
    height: 20px;
    width: 20px;
    -webkit-animation: pulsate 2s ease-out;
    -webkit-animation-iteration-count: infinite; 
    opacity: 0.0;
    position: absolute;
}

@-webkit-keyframes pulsate {
    0% {-webkit-transform: scale(0.1, 0.1); opacity: 0.0;}
    50% {opacity: 1.0;}
    100% {-webkit-transform: scale(0.9, 0.9); opacity: 0.0;}
}
</style>