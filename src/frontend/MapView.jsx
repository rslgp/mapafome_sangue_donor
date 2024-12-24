import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CENTER = [-8.0671132, -34.8766719];
const SERVER_ENDPOINT = "http://localhost:5000/mapdata";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const popupContentMake = (blood_row_array) => {
    const bloodTypes = [
        "A+",
        "A-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ];

    const result = [];
    for (let i = 0; i < bloodTypes.length; i++) {
        if (blood_row_array[i] === "TRUE") result.push(bloodTypes[i]);
    }
    let googleDirection = `https://www.google.com/maps/search/${blood_row_array[blood_row_array.length - 1]}`;
    let html_body = `<a href=${googleDirection} target='_blank' rel="noreferrer">Ir para o destino 
    <img className="directionIcon" style="height:18px;width:18px" src="https://maps.gstatic.com/tactile/omnibox/directions-2x-20150909.png"></img></a> <br/>`;
    html_body += result.join(" ")
    return html_body;
};

const loadFromServer = async () => {
    try {
        const fetch_res = await fetch(SERVER_ENDPOINT);
        const data = await fetch_res.json();
        const { rows } = data.result;
        const markers = rows.map(r => {
            return {
                position: r[6].split(","),
                popupContent: popupContentMake(r)
            };
        });
        return markers;
    } catch (e) {
        console.log("error fetch", e);
        return [];
    }
};

const App = () => {
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await loadFromServer();
            setMarkers(data);
        };

        fetchData();
    }, []); // Empty dependency array to run only once

    const addMarker = (markerData) => {
        setMarkers((prevMarkers) => [...prevMarkers, markerData]);
    };

    return (
        <div className="MapView">
            <h1>React Leaflet Map</h1>
            <MapContainer center={CENTER} zoom={13} maxZoom={18} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                {markers.map((marker, index) => {
                    const { position, popupContent } = marker;
                    const label = popupContent || 'No content available';

                    // Dynamically calculate icon size based on content length or height
                    const labelLength = label.length;
                    const iconSize = Math.max(50, Math.min(150, labelLength * 3)); // Adjust multiplier as needed

                    // Create a floating label above the marker pin
                    const icon = L.divIcon({
                        className: 'floating-label',
                        html: `<div style="background: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 5px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${label}</div>`,
                        iconSize: [iconSize, iconSize], // Dynamically set icon size
                        iconAnchor: [iconSize / 2, iconSize], // Anchor based on size
                    });

                    return (
                        <Marker
                            key={index}
                            position={position}
                            icon={icon}
                        />
                    );
                })}
            </MapContainer>

            <button
                onClick={() =>
                    addMarker({ position: [51.51, -0.1], popupContent: 'Another marker!' })
                }
            >
                Add Marker
            </button>
        </div>
    );
};

export default App;
