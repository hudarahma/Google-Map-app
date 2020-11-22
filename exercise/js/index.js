let map;
var infoWindow ;
var markers = [];

function initMap() {
    
    let losAngeles = {lat: 34.063380, lng: -118.358080};
    
    map = new google.maps.Map(document.getElementById("map"), {
    center: losAngeles,
    zoom: 11
  });
    infoWindow = new google.maps.InfoWindow();
 
   
}

const onEnter = (e) => {
    if(e.key == 'Enter'){
        getStores();
    }
}
const createMarker = (letlng, name, address, openStatusText,phone, storeNumber) => {
    let html = `
        <div class='store-info-window'>
            <div class='store-info-name'>
                ${name}
            </div>
            <div class='store-info-open-status'>
                ${openStatusText}
            </div>
            <div class='store-info-address'>
                <div class='icon'>
                    <i class="fas fa-location-arrow"></i>
                </div>
                <span>
                 ${address}
                </span>
            </div>
            <div class='store-info-phone'>
                <div class='icon'>
                    <i class="fas fa-phone-alt"></i>
                </div>
                <span>
                    <a href='tel:${phone}'>${phone}</a>
                </span>
            </div>

        </div>`;
    var marker = new google.maps.Marker({
        position: letlng,
        map: map,
        label:`${storeNumber}` 
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker);
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-container');
    // console.log(storeElements);
    console.log(markers);
    storeElements.forEach((elem, index) => {
        elem.addEventListener('click', () => {
            google.maps.event.trigger(markers[index], 'click');
        })
       
    })

}

const searchLocationNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();

    stores.forEach((store, index)=>{
        let letlng = new google.maps.LatLng(
            store.location.coordinates[1],  //lat
            store.location.coordinates[0]   //lng
        );
        let name = store.storeName;
        let address = store.addressLines[0];
        let phone = store.phoneNumber;
        let openStatusText = store.openStatusText;
        bounds.extend(letlng);

        createMarker(letlng, name, address, openStatusText, phone, index+1);
    });
    map.fitBounds(bounds);
}

const setStoreList = (stores) => {
    let storesHtml = '';
    stores.forEach((store, index)=>{
        storesHtml += `
            <div class="store-container">
                <div class="store-container-background">
                    <div class="store-info-container">
                        <div class="store-address">
                            <span>${store.addressLines[0]}</span>
                            <span>${store.addressLines[1]}</span>
                        </div>
                        <div class="store-phone-number">
                            ${store.phoneNumber}
                        </div>
                
                        <div class="store-number-container">
                            <div class="store-number">${index+1}</div>
                        </div>
                    </div>
                
                </div>
            </div>
        `
    })
    document.querySelector('.stores-list').innerHTML = storesHtml;
}
const getStores = () => {
    const zipCode = document.getElementById('zip-code').value;
    if (!zipCode){
        return;
    }

    const API_URL = 'http://localhost:3000/api/stores';
    const fulUrl = `${API_URL}?zip_code=${zipCode}`;
    fetch(fulUrl)
    .then((response)=>{
        if(response.status == 200) {
            return response.json();
        } else {
            throw new Error(response.status);
        }
    }).then((data)=>{
        if(data.length > 0) {
            clearLocations();
            searchLocationNear(data);
            setStoreList(data);
            setOnClickListener();
        } else {
            clearLocations();
            noStoresFound();
        }
       
    });
}

const clearLocations = () => {
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0 ;
}

const noStoresFound = () => {
    const html = `
        <div class='no-stores-found'>
            NO Stores Found
        </div>
    `;
    document.querySelector('.stores-list').innerHTML = html;
}