function pintarCarga(estado) {
    document.getElementById("vista-carga").hidden = estado.vista !== "carga";

    const zona = document.getElementById("zona-carga");
    zona.classList.toggle("esta-arrastrando", estado.estaArrastrando);

    document.getElementById("zona-carga-icono").textContent = ICONOS.zonaCarga;
    document.getElementById("privacidad-icono").textContent = ICONOS.privacidad;
    document.getElementById("zona-carga-detalle").textContent =
        "PNG, JPG o WebP · hasta " + formatearMegapixeles(LIMITE_PIXELES) + " por imagen";
}
