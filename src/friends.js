import './styles/styles.scss';
import renderFriendsFn from './../friend.hbs';

let user = {
    vkFriendsList: [],
    localFriendsList: []
}
const resultsFriend = document.querySelector('.search-content__list--friend');
const resultsFilter = document.querySelector('.search-content__list--filter');
const searchBody = document.querySelector('.search-content');

searchBody.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('search-content__item-btn')) {
        let id = evt.target.dataset.id;
        let action = evt.target.dataset.action;

        (action === 'add') ? addToLocalFriendsList(id) : removeFromLocalFriensList(id);
    }
})

VK.init({
    apiId: 6670397
});

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve()
            } else {
                reject(new Error('Не удалось авторизоваться'))
            }
        }, 2)
    })
}

function callAPI(method, params) {
    params.v = '5.80';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        })
    })

}

auth()
    .then(() => {
        return callAPI('friends.get', { fields: 'photo_50', count: 5, order: 'random' })
    })
    .then((friends) => {
        user.vkFriendsList = friends.items;
        renderLists()
    })

function renderLists() {
    const htmlFriend = renderFriendsFn({ items: user.vkFriendsList, isLeft: true })
    const htmlFilter = renderFriendsFn({ items: user.localFriendsList, isLeft: false })
    console.log(user.vkFriendsList, user.localFriendsList);
    
    clearLists();
    resultsFriend.innerHTML = htmlFriend;
    resultsFilter.innerHTML = htmlFilter;
}

function clearLists() {
    resultsFriend.innerHTML = '';
    resultsFilter.innerHTML = '';
}

function addToLocalFriendsList(id) { 
    // moveToArray(id, user.vkFriendsList, user.localFriendsList)

      let friend = user.vkFriendsList.find((item) => {
          return item.id === Number(id);
      })

      user.localFriendsList.push(friend);

      user.vkFriendsList = user.vkFriendsList.filter((item) => {
          return item.id !== Number(id);
      })

    renderLists()
}

function removeFromLocalFriensList(id) {
    // moveToArray(id, user.localFriendsList, user.vkFriendsList);

      let friend = user.localFriendsList.find((item) => {
          return item.id === Number(id);
      })

      user.vkFriendsList.push(friend);

      user.localFriendsList = user.localFriendsList.filter((item) => {
          return item.id !== Number(id);
      })

    renderLists()
}

function moveToArray(id, firstArr, secondArr) {
      let friend = firstArr.find((item) => {
          return item.id === Number(id);
      })

      secondArr.push(friend);

      firstArr = firstArr.filter((item) => {
          return item.id !== Number(id);
      })
}