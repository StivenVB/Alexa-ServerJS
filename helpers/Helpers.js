function getServiceLayerDate() {

    const fechaActual = new Date();
    const serviceLayerDate = fechaActual.getFullYear() + "-" + (fechaActual.getMonth() + 1) +
        "-" + fechaActual.getDate();

    return serviceLayerDate;
}

module.exports = { getServiceLayerDate }