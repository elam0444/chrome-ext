function setPlacesAddedResume(placesSavedQty, guide) {
  document.getElementById('places-added-resume').innerHTML = placesSavedQty + ' places added to ' + guide.name;
}

function getShareRecommendationTitle(guide) {
  return  'Please, check the great guide "' + guide.name + '" in Mulu!';
}

function getUrlToShare(muluUser, guide) {
  return FRONTEND_URL + 'guides/' + muluUser.slug + '/' + guide.slug;
}

function setWhatsappHref(muluUser, guide) {
  var whatsappUrl = 'https://web.whatsapp.com/send?text=' + getShareRecommendationTitle(guide) +
                    '. View here: ' + getUrlToShare(muluUser, guide);

  document.getElementById('link-share-whatsapp').href = whatsappUrl;
}

function setFacebookHref(muluUser, guide) {
  var facebookUrl = 'http://www.facebook.com/sharer.php?u=' + getUrlToShare(muluUser, guide);

  document.getElementById('link-share-facebook').href = facebookUrl;
}

function setTwitterHref(muluUser, guide) {
  var twitterUrl = 'https://twitter.com/share?text=' + getShareRecommendationTitle(guide) +
                    '. View here: ' + '&amp;url=' + getUrlToShare(muluUser, guide);

  document.getElementById('link-share-twitter').href = twitterUrl;
}

window.onload = function() {
  var placesSavedQty = localStorage.getItem('placesSavedQty') ? parseInt(localStorage.getItem('placesSavedQty')) : 0;
  var muluUser = JSON.parse(localStorage.getItem('muluUser'));
  var guide = JSON.parse(localStorage.getItem('guide'));

  setPlacesAddedResume(placesSavedQty, guide);
  setWhatsappHref(muluUser, guide);
  setFacebookHref(muluUser, guide);
  setTwitterHref(muluUser, guide);
};
