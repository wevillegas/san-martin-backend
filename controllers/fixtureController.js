// controllers/fixtureController.js

let fixtureCache = null;
let ultimaActualizacion = 0;
const TIEMPO_CACHE = 1000 * 60 * 60 * 2; // 2 horas

const obtenerFixture = async (req, res) => {
    const ahora = Date.now();

    if (fixtureCache && (ahora - ultimaActualizacion < TIEMPO_CACHE)) {
        return res.json(fixtureCache);
    }

    try {
        const urlEquipos = 'https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/teams?limit=50';
        const resEquipos = await fetch(urlEquipos);
        const dataEquipos = await resEquipos.json();
        
        let idDelSanto = null;
        const listaEquipos = dataEquipos.sports[0].leagues[0].teams;
        
        listaEquipos.forEach(elemento => {
            if (elemento.team.name.toLowerCase().includes('tucum')) {
                idDelSanto = elemento.team.id;
            }
        });

        if (!idDelSanto) {
            return res.status(404).json({ mensaje: "No se encontró el equipo en la API." });
        }

        const urlFixture = `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.2/teams/${idDelSanto}/schedule`;
        const resFixture = await fetch(urlFixture);
        const dataFixture = await resFixture.json();
        
        const partidosBrutos = dataFixture.events;
        const partidosFormateados = [];

        // Logo genérico de ESPN por si acaso
        const logoDefault = "https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo-500.png";

        partidosBrutos.forEach(partido => {
            const competicion = partido.competitions && partido.competitions[0];
            if (!competicion) return;

            const local = competicion.competitors?.find(c => c.homeAway === 'home');
            const visitante = competicion.competitors?.find(c => c.homeAway === 'away');
            
            if (!local || !visitante) return; // Validación extra

            const nodoEstado = competicion.status || partido.status;
            const codigoEstado = nodoEstado?.type?.state || "pre";
            
            const nombreLocal = local?.team?.displayName || local?.team?.shortDisplayName || local?.team?.name || "Local";
            const nombreVisita = visitante?.team?.displayName || visitante?.team?.shortDisplayName || visitante?.team?.name || "Visitante";
            
            // LA SOLUCIÓN MAESTRA: Construimos la URL oficial de ESPN usando el ID del equipo.
            // Esto es 100% confiable.
            const urlLogoLocal = local?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${local.team.id}.png` : logoDefault;
            const urlLogoVisita = visitante?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${visitante.team.id}.png` : logoDefault;

            partidosFormateados.push({
                id: partido.id,
                fecha: new Date(partido.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                estado: codigoEstado,
                descripcionEstado: nodoEstado?.type?.description || "Por definir",
                local: {
                    nombre: nombreLocal,
                    goles: (codigoEstado === 'post' || codigoEstado === 'in') ? (local?.score?.value ?? "-") : "-",
                    esSanMartin: nombreLocal.toLowerCase().includes('tucum'),
                    escudoUrl: urlLogoLocal
                },
                visitante: {
                    nombre: nombreVisita,
                    goles: (codigoEstado === 'post' || codigoEstado === 'in') ? (visitante?.score?.value ?? "-") : "-",
                    esSanMartin: nombreVisita.toLowerCase().includes('tucum'),
                    escudoUrl: urlLogoVisita
                }
            });
        });

        fixtureCache = partidosFormateados;
        ultimaActualizacion = ahora;
        res.json(fixtureCache);

    } catch (error) {
        console.error("Error Grave:", error.message);
        res.status(500).json({ mensaje: "Error interno conectando con ESPN" });
    }
};

module.exports = { obtenerFixture };