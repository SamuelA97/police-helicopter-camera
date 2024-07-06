import { turnOffCamera, turnOnCamera, cameraIsTurnedOn, watchCamera } from './camera';
import { toggleStaticSpotlight, watchSpotlights, updateSpotlights } from './spotlight';
import { hideNui, showNui, isInSupportedHelicopter, getSeatPlayerIsIn, isSupportedHelicopter } from './util';

const KEYS_CAMERA_TOGGLE = 38; // E
const KEYS_STATIC_SPOTLIGHT_TOGGLE = 25 // Right Mouse Button

let lookForPlayerExitingVehicle = false;
let isInVehicle = false;
on('gameEventTriggered', (name: string, args: Array<any>) => {
    if (name !== 'CEventNetworkPlayerEnteredVehicle') {
        return;
    }

    if (isInVehicle) {
        return;
    }

    isInVehicle = true;

    const vehicle = args[1];
    if (!isSupportedHelicopter(vehicle)) {
        return;
    }

    const playerPed = PlayerPedId();
    const playerVehicle = GetVehiclePedIsIn(playerPed, false);

    if (playerVehicle === vehicle) {
        lookForPlayerExitingVehicle = true;

        showNui();
    }
});

setTick(() => {
    if (isInVehicle && !IsPedInAnyVehicle(PlayerPedId(), false)) {
        isInVehicle = false;
    }

    if ((lookForPlayerExitingVehicle && !IsPedInAnyVehicle(PlayerPedId(), false)) || IsPlayerDead(PlayerId())) {
        hideNui();

        lookForPlayerExitingVehicle = false;
    }

    if (cameraIsTurnedOn()) {
        watchCamera();
    }

    // Camera
    if (IsControlJustPressed(0, KEYS_CAMERA_TOGGLE) && isInSupportedHelicopter()) {
        const playerPed = PlayerPedId();
        const playerVehicle = GetVehiclePedIsIn(playerPed, false);
        const seatIndex = getSeatPlayerIsIn(playerPed, playerVehicle);

        if (seatIndex !== 0 || cameraIsTurnedOn()) {
            turnOffCamera(false);

            return;
        }

        turnOnCamera(false);
    }

    // Static Spotlight
    if (IsControlJustPressed(0, KEYS_STATIC_SPOTLIGHT_TOGGLE) && isInSupportedHelicopter()) {
        toggleStaticSpotlight();
    }

    watchSpotlights();
});

onNet('police-helicopter:spotlight', (data) => {
    updateSpotlights(data);
});
