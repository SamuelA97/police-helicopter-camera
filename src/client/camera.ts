import { isInSupportedHelicopter, seatIsAllowedToUseCamera, getHelicopter, hideHud, getVehicleInCameraView, playTimedSound, showNui, hideNui, showNuiWithTargetingVehicle, showNuiWithCameraTooltip } from './util';

let isActive = false;

let viewScaleform = null;
let camera = null;
let currentFov = 75;

let vehicleLock = null;

function inputRotation() {
    //TODO: Re-make
    const rightAxisX = GetDisabledControlNormal(0, 220);
    const rightAxisY = GetDisabledControlNormal(0, 221);
    const rotation = GetCamRot(camera, 2);

    const speed = 12;

    const newZ = rotation[2] + rightAxisX * -1.0 * speed * 0.25;
    const newX = Math.max(Math.min(20.0, rotation[0] + rightAxisY * -1.0 * speed * 0.25), -89.5);

    SetCamRot(camera, newX, 0.0, newZ, 2);
}

function inputZoom() {
    let newFovValue = 5;
    const cameraFov = GetCamFov(camera);

    if (IsControlJustReleased(0, 241)) {
        newFovValue = cameraFov + (Math.min(currentFov - 5, 75) - cameraFov) * 0.3;
    } else if (IsControlJustReleased(0, 242)) {
        newFovValue = cameraFov + (Math.min(currentFov + 5, 75) - cameraFov) * 0.3;
    }


    if (Math.abs(newFovValue - cameraFov) < 0.3) {
        newFovValue = cameraFov;
    }

    currentFov = newFovValue;
    SetCamFov(camera, newFovValue);
}

function inputVehicleLock() {
    if (vehicleLock) {
        vehicleLock = null;

        const lastRot = GetCamRot(camera, 2);
        const lastFov = GetCamFov(camera);

        turnOffCamera(true);
        turnOnCamera(true);

        SetCamRot(camera, lastRot[0], lastRot[1], lastRot[2], 2);
        SetCamFov(camera, lastFov);
        
        playTimedSound('Warning_Alarm_Loop', 'DLC_H4_Submarine_Crush_Depth_Sounds', 4);

        showNui();

        return;
    }
    
    const vehicleToLock = getVehicleInCameraView(camera);
    if (!vehicleToLock) {
        return;
    }

    vehicleLock = vehicleToLock;

    PointCamAtEntity(camera, vehicleToLock, 0, 0, 0, true);

    showNuiWithTargetingVehicle();
    
    PlaySoundFrontend(-1, '5_SEC_WARNING', 'HUD_MINI_GAME_SOUNDSET', false);
}

export function cameraIsTurnedOn() {
    return isActive;
}

export function watchCamera() {
    if (!isInSupportedHelicopter()) {
        turnOffCamera(true);

        return;
    }

    hideHud();

    inputRotation();

    if (IsControlJustReleased(0, 241) || IsControlJustReleased(0, 242)) {
        inputZoom();
    }

    if (IsControlJustPressed(0, 26)) {
        SetCamRot(camera, 0, 0, GetEntityHeading(getHelicopter()), 0);
        SetCamFov(camera, 70);
    }

    if (IsControlJustPressed(0, 22)) {
        inputVehicleLock();
    }

    const helicopter = getHelicopter();
    const helicopterPosition = GetEntityCoords(helicopter, true);
    const cameraRotation = GetCamRot(camera, 2);

    BeginScaleformMovieMethod(viewScaleform, 'SET_ALT_FOV_HEADING');
    ScaleformMovieMethodAddParamFloat(helicopterPosition[2]);
    ScaleformMovieMethodAddParamFloat(1.0 / (75 - 5) * (GetCamFov(camera) - 5));
    ScaleformMovieMethodAddParamFloat(cameraRotation[2]);
    EndScaleformMovieMethod();

    DrawScaleformMovieFullscreen(viewScaleform, 255, 255, 255, 255, 0);
}

export function turnOffCamera(skipSound: boolean) {
    if (!isActive) {
        return;
    }

    ClearTimecycleModifier();
    SetScaleformMovieAsNoLongerNeeded(viewScaleform);

    RenderScriptCams(false, false, 0, true, false);
    DestroyCam(camera, false);

    hideNui();

    isActive = false;
    viewScaleform = null;
    camera = null;

    if (!skipSound) {
        PlaySoundFrontend(-1, 'Off', 'GTAO_Vision_Modes_SoundSet', false);
    }
}

export function turnOnCamera(skipSound: boolean) {
    if (isActive || !isInSupportedHelicopter() || !seatIsAllowedToUseCamera()) {
        return;
    }

    if (!skipSound) {
        PlaySoundFrontend(-1, 'Recharged', 'DLC_AW_Machine_Gun_Ammo_Counter_Sounds', false);
    }

    SetTimecycleModifier('heliGunCam');
    SetTimecycleModifierStrength(0.3);
    viewScaleform = RequestScaleformMovie('HELI_CAM');

    const helicopter = getHelicopter();
    camera = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);
    AttachCamToEntity(camera, helicopter, 0, 0, -1.5, true);
    SetCamFov(camera, 70);
    SetCamRot(camera, 0, 0, GetEntityHeading(helicopter), 2);
    RenderScriptCams(true, false, 0, true, false);

    showNuiWithCameraTooltip();

    isActive = true;
}
