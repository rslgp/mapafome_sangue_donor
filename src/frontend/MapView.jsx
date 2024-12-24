import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import createMarker from "./util/marker.jsx";
import ClickHandler from './util/clickHandler.jsx';

const CENTER = [-8.0671132, -34.8766719];
const SERVER_ENDPOINT = "http://localhost:5000/mapdata";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const popupContentMake = (boolean_array) => {
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
        if (boolean_array[i] === "TRUE") result.push(bloodTypes[i]);
    }
    return result.join(" | ");
};

const loadFromServer = async () => {
    try {
        const fetch_res = await fetch(SERVER_ENDPOINT);
        const data = await fetch_res.json();
        const { rows } = data.result;
        const markers = rows.map(r => {
            return {
                position: r[6].split(","), popupContent: popupContentMake(r)
            };
        });
        console.log(markers);
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
            <MapContainer center={CENTER} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                {markers.map((marker, index) => createMarker(marker, index))}

                <ClickHandler addMarker={addMarker} />
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
