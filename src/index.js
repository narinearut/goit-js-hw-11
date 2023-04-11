
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { FetchJs } from './axiosFetch';
import { debounce } from 'debounce';

const fetchJs = new FetchJs();
const form = document.querySelector('#search-form');
const btnSubmit = document.querySelector('button');
const section = document.querySelector('.gallery');
const btnLoadmore = document.querySelector('.load-more');
const TIME = 400;

btnLoadmore.classList.add('is-hidden');
btnSubmit.setAttribute('disabled', true);

form.addEventListener('submit', onBtnSubmit);
btnLoadmore.addEventListener('click', debounce(onBtnLoadClick, TIME));
form.addEventListener('input', onBtnInput);
// window.addEventListener('scroll', infinityScroll);

function onBtnInput(e) {
    fetchJs.querry = e.target.value.trim();
    fetchJs.querry
    ? btnSubmit.removeAttribute('disabled')
    : btnSubmit.setAttribute('disabled', true);
}

async function onBtnSubmit(e) {
  e.preventDefault();
  fetchJs.page = 1;
  section.innerHTML = '';
  fetchJs.querry = e.target.elements.searchQuery.value.trim();
  btnLoadmore.classList.add('is-hidden');
  try {
    const { data } = await fetchJs.axiosReturn();
    makeMurkup(data.hits);
    resultUndefined(data.totalHits);

    if (!data.hits.length) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (data.hits.length > 0) {
      Notiflix.Notify.success(`WOOOW! We found ${data.totalHits} images.`);
      btnLoadmore.classList.remove('is-hidden');
    }
  } catch (err) {
    console.log(err);
  }
}

async function onBtnLoadClick() {
    fetchJs.page += 1;

  try {
    const { data } = await fetchJs.axiosReturn();
    makeMurkup(data.hits);
    resultUndefined(data.totalHits);
  } catch (err) {
    console.log(err);
  }
}

function makeMurkup(data) {
  const murkup = data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card"> 
      <a class="gallery__item" href="${largeImageURL}"/>   
      <img src="${webformatURL}" alt="${tags}" loading="lazy" width = 350px height=200px/>
   <div class="info">
      <p class="info-item">
        <b>Likes:</b><span>${likes}</span>
      </p>
      <p class="info-item">
        <b>Views:</b><span>${views}</span>
      </p>
      <p class="info-item" >
        <b> Comments:</b><span>${comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads:</b><span>${downloads}</span>
      </p>
    </div>
  </div>`
    )
    .join('');

    section.insertAdjacentHTML('beforeend', murkup);

  var lightbox = new SimpleLightbox('.gallery a', {
    captionSelector: 'img',
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
    scrollZoom: false,
  });
}

function resultUndefined(totalHits) {
  if (fetchJs.page * fetchJs.per_page > totalHits && totalHits !== 0) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    btnLoadmore.classList.add('is-hidden');
    return;
  }
}