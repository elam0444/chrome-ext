function extractResponse(responseText) {
    var data = JSON.parse(responseText).data;

    if (!data) {
        location.replace('login.html');
    }

    return data;
}

function setLocalStorageTokenFromResponse(muluToken, xhr) {
    var tokenAux = xhr.getResponseHeader('Authorization');

    if (tokenAux) {
        muluToken.token = tokenAux.replace('Bearer ', '');
    }

    localStorage.setItem('muluToken', JSON.stringify(muluToken));
}

// CALLBACK FUNCTION
function initMap() {
    var searchPlacesInput = document.getElementById('search-places-input');
    var autocomplete = new google.maps.places.Autocomplete(searchPlacesInput);

    var searchCitiesInput = document.getElementById('recommendation-name');
    var autocompleteCity = new google.maps.places.Autocomplete(searchCitiesInput);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        if (place && place.photos && place.photos.length > 0) {
            place.images = [];

            for (i = 0; i < place.photos.length; i++) {
                place.images.push(place.photos[i].getUrl({'maxHeight': 300}));
            }

            place.main_image = place.images[0];
        }

        pushPlaceToLocalStorage(place);

        searchPlacesInput.value = '';
    });

    autocompleteCity.addListener('place_changed', function () {

    });
}

loadFromLocalStorage();

function pushPlaceToLocalStorage(place) {
    var places = localStorage.getItem('places') ?
        JSON.parse(localStorage.getItem('places')) : [];

    if (places.length == 0) {
        showAddGuidesHideAskFriend();
    }

    place.google_id = place.id.toString();
    places.push(place);
    localStorage.setItem('places', JSON.stringify(places));

    loadFromLocalStorage();
}

function loadFromLocalStorage() {
    var places = localStorage.getItem('places') ?
        JSON.parse(localStorage.getItem('places')) : [];
    var placesAddedWrapper = document.getElementById('places-added-wrapper');

    if (placesAddedWrapper) {
        placesAddedWrapper.innerHTML = '';

        places.forEach(function (place, i) {
            var divMainWrapper, divMainContent, divLeftWrapper, divLeftContent, imgLeft, divRightWrapper,
                headerRightContent, addressRightContent;

            divMainWrapper = document.createElement('div');
            divMainWrapper.className += 'mb-15 place';

            divMainContent = document.createElement('div');
            divMainContent.className += 'clearfix';

            divLeftWrapper = document.createElement('div');
            divLeftWrapper.className += 'content left';

            divLeftContent = document.createElement('div');
            divLeftContent.className += 'image-box';

            imgLeft = document.createElement('img');
            imgLeft.setAttribute('src', place.main_image);

            divLeftContent.appendChild(imgLeft);
            divLeftWrapper.appendChild(divLeftContent);

            divRightWrapper = document.createElement('div');
            divRightWrapper.className += 'content right';

            headerRightContent = document.createElement('h2');
            headerRightContent.className += 'm-0';
            headerRightContent.innerHTML = place.name;

            addressRightContent = document.createElement('p');
            addressRightContent.className += 'location m-0';
            addressRightContent.innerHTML = place.formatted_address;

            divRightWrapper.appendChild(headerRightContent);
            divRightWrapper.appendChild(addressRightContent);

            divMainContent.appendChild(divLeftWrapper);
            divMainContent.appendChild(divRightWrapper);

            divMainWrapper.appendChild(divMainContent);

            placesAddedWrapper.appendChild(divMainWrapper);
        });
    }
}

function createGuide() {
    var guideData = {
        name: document.getElementById('guide-name').value
    };
    var createGuideXHR = new XMLHttpRequest();
    var places = localStorage.getItem('places') ?
        JSON.parse(localStorage.getItem('places')) : [];
    var muluToken = JSON.parse(localStorage.getItem('muluToken'));

    // CREATE NEW
    if (isEmpty(localStorage.getItem('guide-selected-id')) === true) {console.log('create');
        createGuideXHR.open('POST', BACKEND_URL + '/travels', true);
        createGuideXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
        createGuideXHR.setRequestHeader('Content-Type', 'application/json');

        createGuideXHR.onload = function () {
            var guide = extractResponse(this.responseText);

            localStorage.setItem('guide', JSON.stringify(guide));
            localStorage.setItem('placesSavedQty', 0);

            setLocalStorageTokenFromResponse(muluToken, createGuideXHR);
            createPlaces(places);
        };
        createGuideXHR.send(JSON.stringify(guideData));
    } else {console.log('update');
        var guides = localStorage.getItem('guides');
        var items = JSON.parse(guides);
        var guideId = localStorage.getItem('guide-selected-id');

        for (var i in items.data){
            if (guides.hasOwnProperty(i)) {
                if(JSON.stringify(items.data[i].id) === guideId){
                    console.log(items.data[i]);
                    localStorage.setItem('guide', JSON.stringify(items.data[i]));
                    localStorage.setItem('placesSavedQty', 0);
                }
            }
        }
        createPlaces(places);
    }
}

function createPlaces(places) {
    places.forEach((place, i) => {
        createPlace(place);
    });
}

function createPlace(place) {
    var createPlaceXHR = new XMLHttpRequest();
    var muluToken = JSON.parse(localStorage.getItem('muluToken'));

    createPlaceXHR.open('POST', BACKEND_URL + '/places', true);
    createPlaceXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
    createPlaceXHR.setRequestHeader('Content-Type', 'application/json');

    createPlaceXHR.onload = function () {
        var place = extractResponse(this.responseText);

        createTravelPlace(place, place.images);
    };

    createPlaceXHR.send(JSON.stringify(place));
}

function createTravelPlace(place, placeImages) {

    guideId = JSON.parse(localStorage.getItem('guide')).id;

    var travelPlace = {
        travel_id: guideId,
        place_id: place.id,
        place_name: place.name,
        place_images: placeImages
    };
    var createTravelPlaceXHR = new XMLHttpRequest();
    var muluToken = JSON.parse(localStorage.getItem('muluToken'));

    createTravelPlaceXHR.open('POST', BACKEND_URL + '/travel_places', true);
    createTravelPlaceXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
    createTravelPlaceXHR.setRequestHeader('Content-Type', 'application/json');

    createTravelPlaceXHR.onload = function () {
        var placesSavedQty = parseInt(localStorage.getItem('placesSavedQty'));
        var placesQty = JSON.parse(localStorage.getItem('places')).length;

        placesSavedQty = placesSavedQty ? placesSavedQty + 1 : 1;

        localStorage.setItem('placesSavedQty', placesSavedQty);

        if (placesSavedQty === placesQty) {
            localStorage.removeItem('places');
            location.replace('added.html');
            localStorage.removeItem('guide-selected-id');
        }
    };

    createTravelPlaceXHR.send(JSON.stringify(travelPlace));
}

function resetPopup() {
    var placesAddedWrapper = document.getElementById('places-added-wrapper');

    if (placesAddedWrapper) {
        placesAddedWrapper.innerHTML = '';
    }

    localStorage.removeItem('places');
    document.getElementById('add-places-wrapper').style.display = 'block';
    document.getElementById('ask-friend-wrapper').style.display = 'block';
    document.getElementById('ask-friend-shares-wrapper').style.display = 'none';
    document.getElementById('add-guides-wrapper').style.display = 'none';
    document.getElementById('link-reset-popup').style.display = 'none';
}

function showAddGuidesHideAskFriend() {
    document.getElementById('ask-friend-wrapper').style.display = 'none';
    document.getElementById('add-guides-wrapper').style.display = 'block';
    document.getElementById('link-reset-popup').style.display = 'block';
}

function askRecommendation() {
    var recommendationData = {
        name: document.getElementById('recommendation-name').value
    };
    var askRecommendationXHR = new XMLHttpRequest();
    var muluToken = JSON.parse(localStorage.getItem('muluToken'));

    askRecommendationXHR.open('POST', BACKEND_URL + '/travels/recommendations', true);
    askRecommendationXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
    askRecommendationXHR.setRequestHeader('Content-Type', 'application/json');

    askRecommendationXHR.onload = function () {
        var recommendation = extractResponse(this.responseText);

        localStorage.setItem('recommendation', JSON.stringify(recommendation));
        setAskRecommendationHrefs(recommendation);
        setLocalStorageTokenFromResponse(muluToken, askRecommendationXHR);
        goToRecommendationShares();
    };

    askRecommendationXHR.send(JSON.stringify(recommendationData));
}

function setAskRecommendationHrefs(recommendation) {
    setWhatsappHref(recommendation);
    setFacebookHref(recommendation);
    setTwitterHref(recommendation);
}

function setWhatsappHref(recommendation) {
    var whatsappUrl = 'https://web.whatsapp.com/send?text=' + getAskRecommendationTitle(recommendation) +
        '. Fill them here: ' + getUrlToAskRecommendation(recommendation);

    document.getElementById('link-share-whatsapp').href = whatsappUrl;
}

function setFacebookHref(recommendation) {
    var facebookUrl = 'http://www.facebook.com/sharer.php?u=' + getUrlToAskRecommendation(recommendation);

    document.getElementById('link-share-facebook').href = facebookUrl;
}

function setTwitterHref(recommendation) {
    var twitterUrl = 'https://twitter.com/share?text=' + getAskRecommendationTitle(recommendation) +
        '. Fill them here: ' + '&amp;url=' + getUrlToAskRecommendation(recommendation);

    document.getElementById('link-share-twitter').href = twitterUrl;
}

function goToRecommendationShares() {
    document.getElementById('add-places-wrapper').style.display = 'none';
    document.getElementById('ask-friend-wrapper').style.display = 'none';
    document.getElementById('ask-friend-shares-wrapper').style.display = 'block';
    document.getElementById('link-reset-popup').style.display = 'block';
}

function getAskRecommendationTitle(recommendation) {
    return 'Hey! Could you give me your recommendations for ' + recommendation.name + '?';
}

function getUrlToAskRecommendation(recommendation) {
    return FRONTEND_URL + '/recommendations/mulu-user/' + recommendation.slug;
}

if (!localStorage.getItem('muluToken')) {
    location.replace('signup.html');
}

function getGuideList(q){

    var getGuideXHR = new XMLHttpRequest();
    var muluToken = JSON.parse(localStorage.getItem('muluToken'));

    getGuideXHR.open('GET', BACKEND_URL + '/travels' + '?q=' + q, true);
    getGuideXHR.setRequestHeader('Authorization', 'Bearer ' + muluToken.token);
    getGuideXHR.setRequestHeader('Content-Type', 'application/json');

    getGuideXHR.onreadystatechange = function() {
        if (getGuideXHR.readyState === XMLHttpRequest.DONE) {
            localStorage.setItem('guides', getGuideXHR.responseText);
        }
    };

    getGuideXHR.send(null);
}

// Returns if a value is a string
function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

window.onload = function () {

    var autocompleteGuide = new autoComplete({
        selector: 'input[name="guide-name"]',
        minChars: 1,
        cache: false,
        source: function(term, response){
            getGuideList(term);
            var guides = localStorage.getItem('guides');
            var items = JSON.parse(guides);
            var suggestions = [];

            try{
                for (var i in items.data){
                    if (guides.hasOwnProperty(i)) {
                        var choice = [];
                        choice.push(items.data[i].name);
                        choice.push(items.data[i].id);
                        suggestions.push(choice);
                    }
                }
            } catch(e) {
                console.log("Error", e)
            }

            response(suggestions);
        },
        renderItem: function (item, search){
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            return '<div class="autocomplete-suggestion" data-name="'+item[0]+'" data-id="'+item[1]+'" data-val="'+search+'">'+item[0].replace(re, "<b>$1</b>")+'</div>';
        },
        onSelect: function(e, term, item){
            localStorage.setItem('guide-selected-id', item.getAttribute('data-id'));
            document.getElementById('guide-name').value = item.getAttribute('data-name');
        }
    });

    document.getElementById('guide-name').addEventListener('onchange', function () {
        localStorage.removeItem('guide-selected-id');
    });

    document.getElementById('link-add-guide').addEventListener('click', function () {
        createGuide();
    });

    document.getElementById('link-ask-recommendation').addEventListener('click', function () {
        askRecommendation();
    });

    document.getElementById('link-reset-popup').addEventListener('click', function () {
        resetPopup();
    });

    if (localStorage.getItem('places')) {
        showAddGuidesHideAskFriend();
        loadFromLocalStorage();
    }
};

