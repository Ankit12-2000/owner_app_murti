import { useState, useRef, useEffect } from 'react'
import './LocationPicker.css'

const GOOGLE_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'

function LocationPicker({ value, onChange }) {
  const [showMap, setShowMap] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [coords, setCoords] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const geocoderRef = useRef(null)

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) return
    const existing = document.getElementById('google-maps-script')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (!showMap || !coords || !mapRef.current || !window.google) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: coords.lat, lng: coords.lng },
      zoom: 16,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    })
    mapInstanceRef.current = map

    const marker = new window.google.maps.Marker({
      position: { lat: coords.lat, lng: coords.lng },
      map,
      draggable: true,
      title: 'Shop Location',
    })
    markerRef.current = marker

    // When marker is dragged, update address
    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      const lat = pos.lat()
      const lng = pos.lng()
      setCoords({ lat, lng })
      reverseGeocode(lat, lng)
    })

    // Click on map to move marker
    map.addListener('click', (e) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      marker.setPosition({ lat, lng })
      setCoords({ lat, lng })
      reverseGeocode(lat, lng)
    })

    // Init services
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
  }, [showMap, coords?.lat, coords?.lng])

  // Reverse geocode
  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
    if (!geocoderRef.current) return

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onChange(results[0].formatted_address)
      }
    })
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setFetching(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setShowMap(true)
        reverseGeocode(latitude, longitude)
        setFetching(false)
      },
      () => {
        alert('Location access denied. Please allow location or search manually.')
        setFetching(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Search using Google Places Autocomplete
  const searchAddress = (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }
    setSearching(true)

    if (!window.google) {
      setSearching(false)
      return
    }

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'in' },
        types: ['geocode', 'establishment'],
      },
      (predictions, status) => {
        setSearching(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
        } else {
          setSuggestions([])
        }
      }
    )
  }

  // Debounced search
  const handleSearchInput = (val) => {
    setSearchQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchAddress(val), 300)
  }

  // Select suggestion
  const selectSuggestion = (item) => {
    onChange(item.description)
    setSuggestions([])
    setSearchQuery('')

    // Get coordinates for selected place
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: item.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location
          setCoords({ lat: loc.lat(), lng: loc.lng() })
          setShowMap(true)

          // Update map if already visible
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: loc.lat(), lng: loc.lng() })
            if (markerRef.current) {
              markerRef.current.setPosition({ lat: loc.lat(), lng: loc.lng() })
            }
          }
        }
      })
    }
  }

  return (
    <div className="lp-wrapper">
      {/* Address Input */}
      <div className="lp-input-row">
        <input
          type="text"
          className="lp-input"
          placeholder="Enter shop address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="lp-locate-btn"
          onClick={getCurrentLocation}
          disabled={fetching}
          title="Use my current location"
        >
          {fetching ? (
            <span className="lp-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>
      </div>

      {/* Search box */}
      <div className="lp-search-box">
        <div className="lp-search-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="lp-search-input"
            placeholder="Search location on Google Maps..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          {searching && <span className="lp-spinner-sm" />}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ul className="lp-suggestions">
            {suggestions.map((item) => (
              <li key={item.place_id} onClick={() => selectSuggestion(item)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Google Map */}
      {showMap && coords && (
        <div className="lp-map-container">
          <div ref={mapRef} className="lp-map" />
          <button type="button" className="lp-close-map" onClick={() => setShowMap(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <p className="lp-map-hint">Drag the marker or click on map to adjust location</p>
        </div>
      )}
    </div>
  )
}

export default LocationPicker
