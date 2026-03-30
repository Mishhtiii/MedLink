let map;
      let userMarker
      let hospitalMarkers = []

      function initMap() {
        map = L.map("map").setView([0, 0], 13)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude
              const lon = position.coords.longitude

              map.setView([lat, lon], 15)

              userMarker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup("Your Location")
              findHospitals(lat, lon, 5000)
            },
            (error) => {
              console.error("Geolocation error:", error)
              alert("Could not get your location.")
            }
          )
        } else {
          alert("Geolocation is not supported by your browser.")
        }
      }

      function searchCity() {
        console.log("Find Now button clicked!");
        const cityName = document.getElementById("citySearch").value
        if (cityName) {
          geocodeCity(cityName)
          const hospitalListSection = document.getElementById("hospitalList")
          hospitalListSection.scrollIntoView({ behavior: "smooth" })
        }
      }

      function geocodeCity(cityName) {
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          cityName
        )}&format=json`

        fetch(geocodingUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat)
              const lon = parseFloat(data[0].lon)
              map.setView([lat, lon], 14)
              findHospitals(lat, lon, 10000)
            } else {
              alert("City not found.")
            }
          })
          .catch((error) => console.error("Geocoding error:", error))
      }

      function findHospitals(lat, lon, radius) {
        const query = `
                [out:json];
                (
                    node["amenity"="hospital"](around:${radius},${lat},${lon});
                    way["amenity"="hospital"](around:${radius},${lat},${lon});
                    relation["amenity"="hospital"](around:${radius},${lat},${lon});
                );
                out;
                `

        const overpassUrl = "https://overpass-api.de/api/interpreter"
        const url = overpassUrl + "?data=" + encodeURIComponent(query)

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            displayHospitals(data.elements)
          })
          .catch((error) => console.error("Error:", error))
      }

      function displayHospitals(hospitals) {
        const hospitalList = document.getElementById("hospitalList")
        hospitalList.innerHTML = ""
        hospitalMarkers.forEach((marker) => map.removeLayer(marker))
        hospitalMarkers = []

        hospitals.forEach((hospital) => {
          let lat, lon, name

          if (hospital.type === "node") {
            lat = hospital.lat
            lon = hospital.lon
            name = hospital.tags?.name || "Hospital"
          } else if (hospital.type === "way" || hospital.type === "relation") {
            if (hospital.center) {
              lat = hospital.center.lat
              lon = hospital.center.lon
            } else {
              return
            }
            name = hospital.tags?.name || "Hospital"
          }

          if (lat && lon) {
            const marker = L.marker([lat, lon]).addTo(map).bindPopup(name)
            hospitalMarkers.push(marker)

            const card = document.createElement("div")
            card.className = "hospital-card"

            const img = document.createElement("img")

            img.src =
              "https://5.imimg.com/data5/YQ/BD/UL/SELLER-6629898/hospital-sign-500x500.jpg"
            card.appendChild(img)

            const text = document.createElement("div")
            text.textContent = name;
            card.appendChild(text)

            card.addEventListener("click", () => {
              map.setView([lat, lon], 17)
              marker.openPopup()
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
              )
            })
            hospitalList.appendChild(card)
          }
        })
      }

      initMap()