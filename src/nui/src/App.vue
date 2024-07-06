<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue';

type NuiData = {
    type: string,
    targetingVehicle: boolean,
    isDriver: boolean,
    isCoPilot: boolean,
    showCameraTooltip: boolean,
};

interface Handlers {
    [key: string]: (itemData: any) => void;
}

const isVisible: Ref<boolean> = ref(false);
const isLockedToVehicle: Ref<boolean> = ref(false);
const isDriver: Ref<boolean> = ref(false);
const isCoPilot: Ref<boolean> = ref(false);
const showCameraTooltip: Ref<boolean> = ref(false);

const handlers: Handlers = {
    show: (data: NuiData): void => {
        console.log(JSON.stringify(data))
        isVisible.value = true;

        isLockedToVehicle.value = data?.targetingVehicle ?? false;
        isDriver.value = data?.isDriver ?? false;
        isCoPilot.value = data?.isCoPilot ?? false;
        showCameraTooltip.value = data?.showCameraTooltip ?? false;
    },
    hide: (): void => {
        isVisible.value = false;

        isLockedToVehicle.value = false;
    },
};

const handleMessageListener = (event: MessageEvent): void => {
    const data: any = event?.data;

    if (handlers[data.type]) {
        handlers[data.type](data)
    };
};

onMounted(() => {
    window.addEventListener('message', handleMessageListener);
})
</script>

<template>
    <div v-if="isVisible">
        <div class="bindings-overlay">
            <div class="bindings" v-if="isCoPilot && showCameraTooltip">
                <div class="binding">
                    <span class="key">E</span>
                    <span class="action">Stäng av kameran</span>
                </div>
                <div class="binding">
                    <span class="key">Scroll Upp</span>
                    <span class="action">Zooma In</span>
                </div>
                <div class="binding">
                    <span class="key">Scroll Ner</span>
                    <span class="action">Zooma Ut</span>
                </div>
                <div class="binding">
                    <span class="key">C</span>
                    <span class="action">Återställ kamera</span>
                </div>
                <div class="binding">
                    <span class="key">Mellanslag</span>
                    <span class="action" v-if="!isLockedToVehicle">Lås kamera på fordon</span>
                    <span class="action" v-else>Återställ kamera lås</span>
                </div>
            </div>
            <div class="bindings" v-else-if="isDriver || isCoPilot">
                <div class="binding">
                    <span class="key">Höger klick</span>
                    <span class="action">Sätt på/Stäng av sökljus</span>
                </div>
                <div class="binding" v-if="isCoPilot">
                    <span class="key">E</span>
                    <span class="action">Sätt på kameran</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
::-webkit-scrollbar {
    width: 0;
    display: inline !important;
}

.bindings-overlay {
    position: fixed;
    top: 15%;
    right: 0;
    width: 280px;
    /* Adjust width as needed */
    background-color: #33333356;
    color: #fff;
    padding: 10px;
    box-sizing: border-box;
    font-size: 16px;
}

.bindings {
    display: flex;
    flex-direction: column;
}

.binding {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.key {
    font-weight: bold;
}

.action {
    flex-grow: 1;
    text-align: right;
}
</style>
