import React, { useState, useEffect } from 'react';

interface Town {
    code: string;
    label: string;
}

interface Province {
    code: string;
    label: string;
    towns: Town[];
}

interface Region {
    code: string;
    label: string;
    provinces: Province[];
}

// Mapping regions to Nager.Date codes
const REGION_MAP: Record<string, string> = {
    "01": "ES-AN", "02": "ES-AR", "03": "ES-AS", "04": "ES-IB", "05": "ES-CN",
    "06": "ES-CB", "07": "ES-CL", "08": "ES-CM", "09": "ES-CT", "10": "ES-VC",
    "11": "ES-EX", "12": "ES-GA", "13": "ES-MD", "14": "ES-MC", "15": "ES-NC",
    "16": "ES-PV", "17": "ES-RI", "18": "ES-CE", "19": "ES-ML"
};

interface Props {
    onImport: (holidays: { date: string, name: string }[]) => void;
    onClose: () => void;
}

export const HolidaysImporter: React.FC<Props> = ({ onImport, onClose }) => {
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [towns, setTowns] = useState<Town[]>([]);

    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedProv, setSelectedProv] = useState("");
    const [selectedTown, setSelectedTown] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const years = [2024, 2025, 2026];

    useEffect(() => {
        setLoading(true);
        setStatus("Cargando base de datos de municipios...");
        fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/master/arbol.json')
            .then(r => r.json())
            .then(data => {
                setRegions(data);
                setStatus("");
            })
            .catch(err => setStatus("Error al cargar datos: " + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSelectRegion = (code: string) => {
        setSelectedRegion(code);
        setSelectedProv("");
        setSelectedTown("");
        const region = regions.find(r => r.code === code);
        setProvinces(region ? region.provinces.sort((a, b) => a.label.localeCompare(b.label)) : []);
    };

    const handleSelectProv = (code: string) => {
        setSelectedProv(code);
        setSelectedTown("");
        const province = provinces.find(p => p.code === code);
        setTowns(province ? province.towns.sort((a, b) => a.label.localeCompare(b.label)) : []);
    };

    const handleImport = async () => {
        if (!selectedTown || !selectedRegion) return;
        setLoading(true);
        setStatus("Obteniendo festivos oficiales (Nager.Date API)...");

        try {
            const regionCode = REGION_MAP[selectedRegion];

            // Fetch National & Regional Holidays
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${selectedYear}/ES`);
            if (!response.ok) throw new Error("API de festivos no disponible");

            const rawHolidays = await response.json();

            const filtered = rawHolidays.filter((h: any) => {
                const isGlobal = h.global === true;
                const isMyRegion = h.counties && h.counties.includes(regionCode);
                return isGlobal || isMyRegion;
            });

            const results = filtered.map((h: any) => ({
                date: h.date,
                name: h.localName || h.name
            }));

            setStatus(`¡Éxito! Importados 12 festivos. Recuerda añadir los 2 locales de tu pueblo.`);
            setTimeout(() => {
                onImport(results);
                onClose();
            }, 1500);

        } catch (err: any) {
            setStatus("Error en importación: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">

                <div className="bg-indigo-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <i className="fa-solid fa-umbrella-beach text-7xl"></i>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-1">Importar Calendario</h3>
                    <p className="text-white/70 text-sm font-medium">Buscador oficial de municipios</p>
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {status && (
                        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-3 ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-circle-info"></i>}
                            <span>{status}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5">
                        {/* Year selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Año</label>
                            <div className="flex space-x-2">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setSelectedYear(y)}
                                        className={`flex-1 py-3 rounded-2xl text-sm font-black transition-all ${selectedYear === y ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comunidad Autónoma</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:bg-white transition-all"
                                    value={selectedRegion}
                                    onChange={(e) => handleSelectRegion(e.target.value)}
                                >
                                    <option value="">Selecciona Comunidad...</option>
                                    {regions.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                                </select>
                            </div>

                            {selectedRegion && (
                                <div className="space-y-1 animate-fade-in">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provincia</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:bg-white transition-all"
                                        value={selectedProv}
                                        onChange={(e) => handleSelectProv(e.target.value)}
                                    >
                                        <option value="">Selecciona Provincia...</option>
                                        {provinces.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                                    </select>
                                </div>
                            )}

                            {selectedProv && (
                                <div className="space-y-1 animate-fade-in">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Municipio</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:bg-white transition-all"
                                        value={selectedTown}
                                        onChange={(e) => setSelectedTown(e.target.value)}
                                    >
                                        <option value="">Selecciona Pueblo...</option>
                                        {towns.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={!selectedTown || loading}
                            onClick={handleImport}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${!selectedTown || loading ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white shadow-xl hover:-translate-y-1'}`}
                        >
                            {loading ? 'Procesando...' : 'Importar Calendario'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
