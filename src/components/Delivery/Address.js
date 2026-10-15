
import { useState, useCallback } from "react";
import styles from "../../styles/module/Delivery.module.css";
import {
    GoogleMap,
    Marker,
    useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places"];

const mapContainerStyle = {
    width: "100%",
    height: "350px",
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.209,
};

function DeliveryMap({ apiKey, location, onMapClick }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries,
    });

    if (loadError) {
        return (
            <p className={styles.mapHelp}>
                Map could not load. Please enter your address manually.
            </p>
        );
    }

    if (!isLoaded) {
        return <p className={styles.mapHelp}>Loading map...</p>;
    }

    return (
        <div className={styles.mapContainer}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location || defaultCenter}
                zoom={location ? 17 : 10}
                onClick={onMapClick}
            >
                {location && <Marker position={location} />}
            </GoogleMap>
        </div>
    );
}

export default function Delivery({ onAddressConfirmed }) {
    const mapsApiKey =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        house: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        latitude: null,
        longitude: null,
    });

    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [message, setMessage] = useState("");

    // Handle form fields
    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Convert latitude and longitude into a readable address
    const getAddressFromCoordinates = useCallback(
        async (lat, lng) => {
            const saveAddress = ({ house, street, city, state, pincode }) => {
                setAddress((prev) => ({
                    ...prev,
                    house: house || prev.house,
                    street: street || prev.street,
                    city: city || prev.city,
                    state: state || prev.state,
                    pincode: pincode || prev.pincode,
                    latitude: lat,
                    longitude: lng,
                }));
            };

            if (window.google?.maps?.Geocoder) {
                try {
                    const geocoder = new window.google.maps.Geocoder();
                    const response = await geocoder.geocode({
                        location: { lat, lng },
                    });

                    if (response.results?.length) {
                        const result = response.results[0];
                        const components = result.address_components || [];
                        const getComponent = (type) => {
                            const component = components.find((item) =>
                                item.types.includes(type)
                            );

                            return component?.long_name || "";
                        };

                        saveAddress({
                            house: getComponent("street_number"),
                            street:
                                getComponent("route") ||
                                getComponent("sublocality_level_1") ||
                                getComponent("sublocality") ||
                                result.formatted_address,
                            city:
                                getComponent("locality") ||
                                getComponent("administrative_area_level_3") ||
                                getComponent("sublocality_level_1"),
                            state: getComponent("administrative_area_level_1"),
                            pincode: getComponent("postal_code"),
                        });
                        setMessage(
                            "Location and address fetched. Please verify the details before confirming."
                        );
                        return;
                    }
                } catch (error) {
                    console.warn("Google reverse geocoding failed; trying fallback.", error);
                }
            }

            try {
                const query = new URLSearchParams({
                    format: "jsonv2",
                    addressdetails: "1",
                    lat: String(lat),
                    lon: String(lng),
                });
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?${query}`,
                    { headers: { Accept: "application/json" } }
                );

                if (!response.ok) {
                    throw new Error(`Reverse lookup returned ${response.status}`);
                }

                const result = await response.json();
                const parts = result.address || {};
                const street =
                    parts.road ||
                    parts.pedestrian ||
                    parts.neighbourhood ||
                    parts.suburb ||
                    result.display_name;

                if (!street && !parts.city && !parts.town && !parts.village) {
                    throw new Error("No address details were returned.");
                }

                saveAddress({
                    house: parts.house_number,
                    street,
                    city:
                        parts.city ||
                        parts.town ||
                        parts.village ||
                        parts.municipality ||
                        parts.county,
                    state: parts.state,
                    pincode: parts.postcode,
                });
                setMessage(
                    "Location and address fetched. Please verify the details before confirming."
                );
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                setMessage(
                    "GPS coordinates fetched, but the address lookup failed. Please enter your address manually."
                );
            }
        },
        []
    );

    // Get current GPS location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage(
                "Your browser does not support location. Please enter your address manually."
            );
            return;
        }

        setLoadingLocation(true);
        setMessage(
            "Getting your current location. Please allow location access..."
        );

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const currentLocation = { lat, lng };

                setLocation(currentLocation);

                // Save coordinates, even if address lookup is unavailable.
                setAddress((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));

                try {
                    await getAddressFromCoordinates(lat, lng);
                } finally {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                console.error(
                    "Location error:",
                    error.code,
                    error.message
                );

                const errorMessages = {
                    1: "Location permission denied. Allow location access in your browser settings.",
                    2: "Your location is unavailable. Turn on device location services and try again.",
                    3: "Location request timed out. Please try again.",
                };

                setMessage(
                    errorMessages[error.code] ||
                    "Unable to get your location. Please enter your address manually."
                );

                setLoadingLocation(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000,
            }
        );
    };

    // Allow customer to select a location on the map
    const handleMapClick = async (event) => {
        if (!event.latLng) return;

        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const selectedLocation = { lat, lng };

        setLocation(selectedLocation);

        setAddress((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));

        setMessage("Selected map location. Fetching address...");

        await getAddressFromCoordinates(lat, lng);
    };

    // Validate and confirm the delivery address
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!address.name.trim()) {
            setMessage("Please enter your name.");
            return;
        }

        if (!/^[0-9]{10}$/.test(address.phone)) {
            setMessage("Please enter a valid 10-digit phone number.");
            return;
        }

        if (!address.house.trim()) {
            setMessage("Please enter house/building address.");
            return;
        }

        if (!address.street.trim()) {
            setMessage("Please enter your street or area.");
            return;
        }

        if (!address.city.trim()) {
            setMessage("Please enter your city.");
            return;
        }

        if (!address.state.trim()) {
            setMessage("Please enter your state.");
            return;
        }

        if (!/^[0-9]{6}$/.test(address.pincode)) {
            setMessage("Please enter a valid 6-digit pincode.");
            return;
        }

        const deliveryAddress = {
            ...address,
            latitude: location?.lat ?? address.latitude ?? null,
            longitude: location?.lng ?? address.longitude ?? null,
        };

        console.log("Confirmed delivery address:", deliveryAddress);

        onAddressConfirmed(deliveryAddress);
    };

    return (
        <section
            className={styles.deliveryContainer}
            aria-labelledby="delivery-title"
        >
            <h1 id="delivery-title" className={styles.title}>
                Delivery Address
            </h1>

            <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loadingLocation}
                className={styles.locationButton}
            >
                {loadingLocation
                    ? "Fetching Location..."
                    : "Use My Current Location"}
            </button>

            {message && (
                <p className={styles.message} role="status">
                    {message}
                </p>
            )}

            {mapsApiKey ? (
                <>
                    <DeliveryMap
                        apiKey={mapsApiKey}
                        location={location}
                        onMapClick={handleMapClick}
                    />

                    <p className={styles.mapHelp}>
                        You can select your exact delivery location on the map.
                    </p>
                </>
            ) : (
                <p className={styles.mapHelp}>
                    Google Maps API key is not configured. GPS coordinates
                    may still work, but you must enter your address manually.
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className={styles.deliveryForm}
            >
                <div className={styles.fieldGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Full name
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={address.name}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Phone number
                        </span>
                        <input
                            className={styles.input}
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={address.phone}
                            onChange={(e) =>
                                setAddress((prev) => ({
                                    ...prev,
                                    phone: e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10),
                                }))
                            }
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            House / flat / building
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="house"
                            autoComplete="address-line1"
                            value={address.house}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Street / area
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="street"
                            autoComplete="address-line2"
                            value={address.street}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            City
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="city"
                            autoComplete="address-level2"
                            value={address.city}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            State
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="state"
                            autoComplete="address-level1"
                            value={address.state}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Pincode
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="pincode"
                            autoComplete="postal-code"
                            inputMode="numeric"
                            maxLength={6}
                            value={address.pincode}
                            onChange={(e) =>
                                setAddress((prev) => ({
                                    ...prev,
                                    pincode: e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6),
                                }))
                            }
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Landmark (optional)
                        </span>
                        <input
                            className={styles.input}
                            type="text"
                            name="landmark"
                            value={address.landmark}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                {location && (
                    <div className={styles.coordinates}>
                        <p>Latitude: {location.lat}</p>
                        <p>Longitude: {location.lng}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.confirmButton}
                >
                    Confirm Delivery Address
                </button>
            </form>
        </section>
    );
}
