import { getHelicopter, calculateDirection } from './util';

let staticIsActive = false;

export function toggleStaticSpotlight() {
    staticIsActive = !staticIsActive;

    emitNet(
        'police-helicopter:spotlight',
        {
            helicopterNetworkId: NetworkGetNetworkIdFromEntity(getHelicopter()),
            enable: staticIsActive,
        },
    );
}

function drawSingleSpotlight(helicopter) {
    const helicopterPosition = GetEntityCoords(helicopter, true);

    const playerPostion = GetEntityCoords(PlayerPedId(), true);
    const distance = Vdist(helicopterPosition[0], helicopterPosition[1], helicopterPosition[2], playerPostion[0], playerPostion[1], playerPostion[2]);

    // Too far away
    if (distance > 500) {
        return;
    }

    const helicopterRot = GetEntityRotation(helicopter, 2);
    const helicopterDirection = calculateDirection({ x: helicopterRot[0] - 20, y: helicopterRot[1], z: helicopterRot[2] });

    DrawSpotLight(
        helicopterPosition[0], helicopterPosition[1], helicopterPosition[2],
        helicopterDirection.x, helicopterDirection.y, helicopterDirection.z,
        255, 255, 255, 300, 9, 4, 10, 75
    );
}

const spotlightsToDraw = {};
export function updateSpotlights(data) {
    const helicopter = NetworkGetEntityFromNetworkId(data.helicopterNetworkId);

    if (data.enable) {
        if (DoesEntityExist(helicopter)) {
            spotlightsToDraw[helicopter] = data;

            return;
        }
    }

    delete spotlightsToDraw[helicopter];
}

export function watchSpotlights() {
    Object.keys(spotlightsToDraw).forEach((key) => {
        const spotlight = spotlightsToDraw[key];
        const helicopter = NetworkGetEntityFromNetworkId(spotlight.helicopterNetworkId);

        if (DoesEntityExist(helicopter)) {
            drawSingleSpotlight(helicopter);
        } else {
            delete spotlightsToDraw[helicopter];
        }
    });
}
