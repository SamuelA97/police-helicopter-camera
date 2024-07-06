const supportedHelicopters = ['polmav'];

const supportedHelicopterHash = [];
supportedHelicopters.forEach((model) => {
    supportedHelicopterHash.push(GetHashKey(model));
});

export function getSupportedHelicopters(): Array<number> {
    return supportedHelicopterHash;
}

export function isSupportedHelicopter(vehicle: number): boolean {
    return getSupportedHelicopters().includes(vehicle);
}

export function isInSupportedHelicopter(): boolean {
    const playerPedId = PlayerPedId();

    return !IsPlayerDead(PlayerId())
        && IsPedInAnyVehicle(playerPedId, false)
        && isSupportedHelicopter(GetEntityModel(GetVehiclePedIsIn(playerPedId, false)));
}

export function getHelicopter(): number {
    return GetVehiclePedIsIn(PlayerPedId(), false);
}

export function seatIsAllowedToUseCamera(): boolean {
    const playerPedId = PlayerPedId();
    const helicopter = getHelicopter();

    return GetPedInVehicleSeat(helicopter, -1) == playerPedId
        || GetPedInVehicleSeat(helicopter, 0) == playerPedId;
}

const hudComponentsToHide = [1, 2, 3, 4, 6, 7, 8, 9, 13, 11, 12, 15, 18, 19];
export function hideHud(): void {
    HideHelpTextThisFrame();
    HideHudAndRadarThisFrame();

    hudComponentsToHide.forEach(id => {
        HideHudComponentThisFrame(id);
    });
}

const PI = Math.PI;

function rad(degrees: number): number {
    return degrees * (PI / 180);
}

function vec3(x: number, y: number, z: number): Vector3 {
    return { x, y, z };
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export function calculateDirection(rotation: Vector3): Vector3 {
    const adjustedRotation = vec3(
        rad(rotation.x),
        rad(rotation.y),
        rad(rotation.z)
    );

    const direction = vec3(
        -Math.sin(adjustedRotation.z) * Math.abs(Math.cos(adjustedRotation.x)),
        Math.cos(adjustedRotation.z) * Math.abs(Math.cos(adjustedRotation.x)),
        Math.sin(adjustedRotation.x)
    );

    return direction;
}

export function getVehicleInCameraView(camera: number) {
    const cameraPosition = GetCamCoord(camera);

    const cameraRot = GetCamRot(camera, 2);
    const cameraDirection = calculateDirection({ x: cameraRot[0], y: cameraRot[1], z: cameraRot[2] });

    const rayEnd = {
        x: cameraPosition[0] + (cameraDirection.x * 950),
        y: cameraPosition[1] + (cameraDirection.y * 950),
        z: cameraPosition[2] + (cameraDirection.z * 950),
    };

    const ray = StartShapeTestRay(
        cameraPosition[0], cameraPosition[1], cameraPosition[2],
        rayEnd.x, rayEnd.y, rayEnd.z,
        350, getHelicopter(), 4
    );

    const [_, hit, endCoords, surfaceNormal, entityHit] = GetShapeTestResult(ray);

    if (hit && IsEntityAVehicle(entityHit)) {
        return entityHit;
    }

    return null;
}

export function wait(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export async function playTimedSound(audioName: string, audioRef: string, delay: number) {
    const soundId = GetSoundId();

    PlaySoundFrontend(soundId, audioName, audioRef, false);

    await wait(delay);

    StopSound(soundId);
    ReleaseSoundId(soundId);
}

export function getSeatPlayerIsIn(playerPed: number, vehicle: number): number | null {
    for (let seatIndex = -1; seatIndex < GetVehicleMaxNumberOfPassengers(vehicle); seatIndex++) {
        if (GetPedInVehicleSeat(vehicle, seatIndex) === playerPed) {
            return seatIndex;
        }
    }

    return null;
}

export function showNui() {
    const playerPed = PlayerPedId();
    const playerVehicle = GetVehiclePedIsIn(playerPed, false);
    
    const seatIndex = getSeatPlayerIsIn(playerPed, playerVehicle);
    SendNuiMessage(JSON.stringify({
        type: 'show',
        isDriver: seatIndex === -1,
        isCoPilot: seatIndex === 0,
        targetingVehicle: false,
        showCameraTooltip: false,
    }));
}

export function showNuiWithCameraTooltip() {
    const playerPed = PlayerPedId();
    const playerVehicle = GetVehiclePedIsIn(playerPed, false);
    
    const seatIndex = getSeatPlayerIsIn(playerPed, playerVehicle);
    SendNuiMessage(JSON.stringify({
        type: 'show',
        isDriver: seatIndex === -1,
        isCoPilot: seatIndex === 0,
        targetingVehicle: false,
        showCameraTooltip: true,
    }));
}

export function showNuiWithTargetingVehicle() {
    const playerPed = PlayerPedId();
    const playerVehicle = GetVehiclePedIsIn(playerPed, false);
    
    const seatIndex = getSeatPlayerIsIn(playerPed, playerVehicle);
    SendNuiMessage(JSON.stringify({
        type: 'show',
        isDriver: seatIndex === -1,
        isCoPilot: seatIndex === 0,
        targetingVehicle: true,
        showCameraTooltip: true,
    }));
}

export function hideNui() {
    SendNuiMessage(JSON.stringify({ type: 'hide' }));
}
