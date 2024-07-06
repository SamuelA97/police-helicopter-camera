interface SpotlightToggle {
    helicopterNetworkId: number,
    enable: boolean,
};

onNet('police-helicopter:spotlight', (data: SpotlightToggle) => {
    const entityId = NetworkGetEntityFromNetworkId(Number(data.helicopterNetworkId));

    if (DoesEntityExist(entityId)) {
        emitNet('police-helicopter:spotlight', -1, data);
    }
});
