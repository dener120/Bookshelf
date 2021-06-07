const requestUrl = './json/books.json';
const inputCheckList = document.querySelectorAll('.form-check-input');
const booksContainer = document.querySelector('#books-list');
const dropFilter = document.querySelector('#drop-filter');
const selectElement = document.querySelector('#sorting');
const searchBtn = document.querySelector('#btn-search');
const searchInput = document.querySelector('#input-search');
const filterBar = document.querySelector('.filter-bar');
const indexPageBtn = document.querySelector('#index-page-btn');
const pageLogo = document.querySelector('#page-logo');
const favoritePageBtn = document.querySelector('#favorite-page-btn');
let pageTitle = document.querySelector('#page-title');


showBooks('', 'alphabetFirst')

dropFilter.addEventListener('click', () => {
    let inputCheckeds = document.querySelectorAll('input:checked');
    dropFilter.classList.add('inactive');

    let selectElementValue = selectElement.value;

    inputCheckeds.forEach(checkedElement => {
        checkedElement.checked = false;
    })

    showBooks('', selectElementValue)
})

inputCheckList.forEach(element => {
    element.addEventListener('click', () => {

        let listInputChekedsValue = getFilterParameters()
        let selectElementValue = selectElement.value;

        if (pageTitle.textContent === 'Поиск') {

        }

        showBooks(listInputChekedsValue, selectElementValue)
    });
});

selectElement.addEventListener('change', (e) => {
    let selectElementValue = e.target.value;
    let filtersParameters = getFilterParameters();

    showBooks(filtersParameters, selectElementValue)
})

searchBtn.addEventListener('click', () => {

    let searchInputValue = searchInput.value.toUpperCase();
    let searchResultBar = document.querySelector('.search-result-bar');
    let searchResultBarText = document.querySelector('.search-result');

    if (!searchInputValue) {
        return
    }

    filterBar.classList.add('inactive');
    selectElement.classList.add('inactive');
    searchResultBar.classList.remove('inactive');

    searchResultBarText.innerHTML = `Результаты поиска по запросу: "${searchInput.value}"`;
    pageTitle.innerHTML = 'Поиск';

    getDataRequest(requestUrl)
        .then(data => {

            let result = data.filter((book) => {
                return book.name.toUpperCase().indexOf(searchInputValue) !== -1;
            });

            searchInput.value = '';

            showSearchBooks(result)
        })
})

indexPageBtn.addEventListener('click', () => {
    goIndexPage()
})

pageLogo.addEventListener('click', () => {
    goIndexPage()
})

booksContainer.addEventListener('click', (e) => {

    if (!document.getElementById(e.target.id)) {
        return
    }

    let btnFavoriteBookCard;
    let btnRatingBookCard;


    if (e.target.id.indexOf('favorite') + 1) {

        btnFavoriteBookCard = document.getElementById(e.target.id);

    }
    if (e.target.id.indexOf('rating') + 1) {

        btnRatingBookCard = document.getElementById(e.target.id);

    }

    if (btnRatingBookCard) {
        if (!btnRatingBookCard.classList[1]) {

            btnRatingBookCard.classList.add('active')

            if (!localStorage.getItem('rating')) {

                localStorage.setItem('rating', e.target.id[e.target.id.length - 1]);

            } else {

                let ratingStorage = localStorage.getItem('rating');

                ratingStorage += ` ${e.target.id[e.target.id.length - 1]}`

                localStorage.setItem('rating', ratingStorage)

            }

        } else if (btnRatingBookCard) {
            btnRatingBookCard.classList.remove('active')

            let ratingStorage = localStorage.getItem('rating').split(' ');

            let indexBockInStorageList = ratingStorage.indexOf(e.target.id[e.target.id.length - 1])

            delete ratingStorage[indexBockInStorageList];

            localStorage.setItem('rating', ratingStorage.join(' '))
        }
    }

    if (btnFavoriteBookCard) {

        if (!btnFavoriteBookCard.classList[1]) {

            btnFavoriteBookCard.classList.add('active');

            if (!localStorage.getItem('favorite')) {

                localStorage.setItem('favorite', e.target.id[e.target.id.length - 1]);

            } else {

                let favoriteStorage = localStorage.getItem('favorite');

                favoriteStorage += ` ${e.target.id[e.target.id.length - 1]}`;

                localStorage.setItem('favorite', favoriteStorage);

            }

        } else if (btnFavoriteBookCard) {
            btnFavoriteBookCard.classList.remove('active');

            if (pageTitle.textContent === 'Избранное') {

                btnFavoriteBookCard.parentNode.parentNode.parentNode.removeChild(btnFavoriteBookCard.parentNode.parentNode);

            }

            let favoriteStorage = localStorage.getItem('favorite').split(' ');

            let indexBockInStorageList = favoriteStorage.indexOf(e.target.id[e.target.id.length - 1]);

            delete favoriteStorage[indexBockInStorageList];
            delete favoriteStorage[indexBockInStorageList];

            localStorage.setItem('favorite', favoriteStorage.join(' '));

        }
    }

})

favoritePageBtn.addEventListener('click', () => {
    let searchResultBar = document.querySelector('.search-result-bar');

    searchResultBar.classList.add('inactive');
    filterBar.classList.add('inactive');
    selectElement.classList.add('inactive');
    dropFilter.classList.add('inactive');

    pageTitle.innerHTML = 'Избранное';

    getDataRequest(requestUrl)
        .then(data => {

            let idFavoriteBooksList = localStorage.getItem('favorite').split(' ');

            idFavoriteBooksList = idFavoriteBooksList.map((idBook) => {
                return parseInt(idBook);
            })

            const result = data.filter(book => {
                return idFavoriteBooksList.includes(book.id);
            });

            showSearchBooks(result)
        })

})


function getDataRequest(url) {
    return fetch(url,{mode: 'cors'})
        .then((response) => response.json());
}

function showBooks(parameterFilterList, parameterSorting) {

    let ratingStorage = localStorage.getItem('rating');

    let ratingStorageInt = [];

    if (ratingStorage !== null) {
        ratingStorage = ratingStorage.split(' ');

        if (ratingStorage.length > 0) {
            ratingStorageInt = ratingStorage.map((id) => {
                return parseInt(id);
            })
        }
    }

    getDataRequest(requestUrl)
        .then(data => {

            let copyBooksList = JSON.parse(JSON.stringify(data));

            copyBooksList = copyBooksList.map((book) => {
                if (ratingStorageInt.includes(book.id)) {
                    book.rating = 1;
                }
                return book;
            })

            if (!arguments[0] || parameterFilterList.length === 0) {

                let sortingBooks = sorting(parameterSorting, copyBooksList);

                booksContainer.innerHTML = '';

                for (let book of sortingBooks) {

                    setTimeout(() => {
                        booksContainer.innerHTML += templateBookCard(book);
                    }, 400);

                }

            } else if (arguments[0]) {

                let intermediateStorage;

                intermediateStorage = getFilterBooks(copyBooksList, parameterFilterList);

                let sortingIntermediateStorage = sorting(parameterSorting, intermediateStorage);

                for (let book of sortingIntermediateStorage) {

                    setTimeout(() => {
                        booksContainer.innerHTML += templateBookCard(book);
                    }, 400);

                }
            }
        })
}

function sorting(parameterSorting, booksList) {

    let sortingBooksList = [];

    if (parameterSorting === 'alphabetFirst') {

        sortingBooksList = booksList.sort((obj1, obj2) => {
            if (obj1.name < obj2.name) return -1;
            if (obj1.name > obj2.name) return 1;
            return 0;
        });

    } else if (parameterSorting === 'alphabetLast') {

        sortingBooksList = booksList.sort((obj1, obj2) => {
            if (obj1.name > obj2.name) return -1;
            if (obj1.name < obj2.name) return 1;
            return 0;
        });

    } else if (parameterSorting === 'ratingFirst') {

        sortingBooksList = booksList.sort((obj1, obj2) => {
            return obj2.rating - obj1.rating;
        });

    } else if (parameterSorting === 'ratingLast') {

        sortingBooksList = booksList.sort((obj1, obj2) => {
            return obj1.rating - obj2.rating;
        });

    } else if (parameterSorting === 'newFirst') {

        sortingBooksList = booksList.sort((obj1, obj2) => {
            return parseInt(obj2.yearOfPublishing) - parseInt(obj1.yearOfPublishing);
        });

    } else if (parameterSorting === 'newLast') {

        sortingBooksList = booksList.sort(function (obj1, obj2) {
            return obj1.yearOfPublishing - obj2.yearOfPublishing;
        });

    }

    return sortingBooksList;
}

function getFilterParameters() {
    let inputCheckeds = document.querySelectorAll('input:checked');

    if (inputCheckeds.length > 0) {
        document.querySelector('#drop-filter').classList.remove('inactive');
    } else {
        document.querySelector('#drop-filter').classList.add('inactive');
    }

    booksContainer.innerHTML = '';

    let parameterPublisherList = [];
    let parameterAuthorList = [];
    let parameterYearList = [];

    inputCheckeds.forEach(checkedElement => {

        let parameterType = checkedElement.getAttribute('criterion');
        let parameterValue = checkedElement.value;

        switch (parameterType) {
            case 'publishingHouse':
                parameterPublisherList.push(parameterValue);
                break;
            case 'author':
                parameterAuthorList.push(parameterValue);
                break;
            case 'yearOfPublishing':
                parameterYearList.push(parseInt(parameterValue));
                break;
        }
    });

    return {
        'publishingHouse': parameterPublisherList,
        'author': parameterAuthorList,
        'yearOfPublishing': parameterYearList
    }

}

function templateBookCard(book) {
    let btnFavoriteIsActive = '';
    let btnRatingIsActive = '';

    if (localStorage.getItem('rating')) {
        let ratingStorage = localStorage.getItem('rating').split(' ')

        if (ratingStorage.length > 0) {
            for (let bookId of ratingStorage) {
                if (book.id === parseInt(bookId)) {
                    btnRatingIsActive = 'active';
                }
            }
        }
    }

    if (localStorage.getItem('favorite')) {
        let favoriteStorage = localStorage.getItem('favorite').split(' ');

        if (favoriteStorage.length > 0) {
            for (let bookId of favoriteStorage) {
                if (book.id === parseInt(bookId)) {
                    btnFavoriteIsActive = 'active'
                }
            }
        }
    }

    return `
      <div class="card book-card col-lg-5 col-xl-3 col-12 col-sm-5 p-3 m-xl-4 m-lg-3 m-1" style="">
                            <img src="./images/${book.picture}" class="book-img card-img-top" alt="...">
                            <div class="card-body">
                                    <h5 class="card-title">${book.name}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
                                    <p class="card-text">${book.yearOfPublishing} </p>
                            </div>
                            <div class="btn-group">
                                <button class="btn-favorites ${btnFavoriteIsActive}" id="favorite ${book.id}"></button>
                                <button class="btn-rating ${btnRatingIsActive}" id="rating ${book.id}"></button>
                            </div>
                        </div>`
}

function getFilterBooks(targetArray, filters) {
    let filterKeys = Object.keys(filters);
    return targetArray.filter((eachObj) => {
        return filterKeys.every((eachKey) => {
            if (!filters[eachKey].length) {
                return true;
            }
            return filters[eachKey].includes(eachObj[eachKey]);
        });
    });
}

function goIndexPage() {
    let inputCheckeds = document.querySelectorAll('input:checked');
    let searchResultBar = document.querySelector('.search-result-bar');
    pageTitle.innerHTML = 'Главная';

    showBooks('', 'alphabetFirst')

    inputCheckeds.forEach(checkedElement => {
        checkedElement.checked = false;
    });

    searchResultBar.classList.add('inactive');
    filterBar.classList.remove('inactive');
    selectElement.classList.remove('inactive');
}

function showSearchBooks(books) {
    let copyBooksList = JSON.parse(JSON.stringify(books));

    booksContainer.innerHTML = '';

    for (let book of copyBooksList) {
        setTimeout(() => {
            booksContainer.innerHTML += templateBookCard(book)
        }, 400);
    }
}