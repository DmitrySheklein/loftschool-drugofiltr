import './styles/styles.scss';
import renderFriendsFn from './../friend.hbs';

let user = {
    vkFriendsList: [],
    localFriendsList: []
}
let filter = {
    vkFilterInput: '',
    localeFilterInput: ''
}
const vkContainer = document.querySelector('.search-content__list--friend');
const localeContainer = document.querySelector('.search-content__list--filter');
const vkFriendsInput = document.querySelector('.search__input--friend');
const localeFriendsInput = document.querySelector('.search__input--filter');
const searchBody = document.querySelector('.search-content');
const saveBtn = document.querySelector('.btn--save');

saveBtn.addEventListener('click', () => {
    localStorage.setItem('friendsVk', JSON.stringify(user.vkFriendsList))
    localStorage.setItem('friendsLocal', JSON.stringify(user.localFriendsList))
})

vkFriendsInput.addEventListener('keyup', (evt) => {
    filter.vkFilterInput = evt.target.value.trim();
    renderLists()        
})

localeFriendsInput.addEventListener('keyup', (evt) => {
    filter.localeFilterInput = evt.target.value.trim();  
    renderLists()
})

searchBody.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('search-content__item-btn')) {
        let id = evt.target.dataset.id;
        let action = evt.target.dataset.action;

        (action === 'add') ? addToLocalFriendsList(id) : removeFromLocalFriensList(id);
    }
})
function init() {
    if (localStorage.getItem('friendsVk') !== null || localStorage.getItem('friendsLocal') !== null) {
        user.vkFriendsList = JSON.parse(localStorage.getItem('friendsVk')) || [];
        user.localFriendsList = JSON.parse(localStorage.getItem('friendsLocal'))|| [];
        renderLists();

        return;
    }
    vkInit();
}

function vkInit() {
    VK.init({
        apiId: 6674281
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
            return callAPI('friends.get', { fields: 'photo_50', order: 'random' })
        })
        .then((friends) => {
            user.vkFriendsList = friends.items;
            renderLists()
        })

}

function renderList(items, container, isLeft = false) {
    let html = renderFriendsFn({
        items: items,
        isLeft: isLeft
    })

    container.innerHTML = html;    
}
function renderLists() {
    clearLists();
    
    if (user.vkFriendsList.length) {
        if (filter.vkFilterInput.length > 0) {
            let vkFilteredArray = user.vkFriendsList.filter((friend)=>{
                return isMatching(friend.first_name, filter.vkFilterInput) || isMatching(friend.last_name, filter.vkFilterInput)
            })

            renderList(vkFilteredArray, vkContainer, true);
        } else {
            renderList(user.vkFriendsList, vkContainer, true);
        }

    }
    if (user.localFriendsList.length) {
        if (filter.localeFilterInput.length > 0) {
            let localFilteredArray = user.localFriendsList.filter((friend)=>{
                return isMatching(friend.first_name, filter.localeFilterInput) || isMatching(friend.last_name, filter.localeFilterInput)
            });
            
            renderList(localFilteredArray, localeContainer, false)
        } else {
            renderList(user.localFriendsList, localeContainer, false);
        }     
    }
   
}

function clearLists() {
    vkContainer.innerHTML = '';
    localeContainer.innerHTML = '';
}

function addToLocalFriendsList(id) { 
    moveToArray(id, user.vkFriendsList, user.localFriendsList);
    renderLists();
}

function removeFromLocalFriensList(id) {
    moveToArray(id, user.localFriendsList, user.vkFriendsList);
    renderLists();
}

function moveToArray(id, firstArr, secondArr) {
    let friend = firstArr.find((item) => {
        return item.id === Number(id);
    })

    secondArr.push(friend);

    let index = firstArr.findIndex((item) => {
        return item.id === Number(id);
    })

    firstArr.splice(index, 1);
}
function changeArray(id, array, elementId, arrayWithELement) {
    let index = array.findIndex((item) => {
        return item.id === Number(id);
    })
    
    let element = arrayWithELement.find((item)=>{
        return item.id === Number(elementId);
    })
    
    array.splice(index, 0, element);

    let indexDeleteElement = arrayWithELement.findIndex((item) => {
        return item.id === Number(elementId);
    })

    arrayWithELement.splice(indexDeleteElement, 1);    
}
function isMatching(full, chunk) {
    return (full.toLowerCase().indexOf(chunk.toLowerCase()) !== -1) ? true : false;
}
makeDnd([vkContainer, localeContainer])
function makeDnd(zones) {
    let currentDrag = null;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', evt => {
            currentDrag = { sourse: zone, node: evt.target, nodeId: evt.target.dataset.id };           
        })
        zone.addEventListener('dragover', evt => {
            evt.preventDefault()
        })
        zone.addEventListener('drop', evt => {
            if (currentDrag) {
                evt.preventDefault();

                if (currentDrag.sourse !== zone) {

                    if (currentDrag.sourse.classList.contains('search-content__list--friend')) {
                        if (evt.target.classList.contains('search-content__item')) {
                            changeArray(evt.target.dataset.id, user.localFriendsList, currentDrag.nodeId, user.vkFriendsList);
                            renderLists()                        
                        } else {
                            addToLocalFriendsList(currentDrag.nodeId)
                        }
                    } else if (currentDrag.sourse.classList.contains('search-content__list--filter')) {
                        if (evt.target.classList.contains('search-content__item')) {
                            changeArray(evt.target.dataset.id, user.vkFriendsList, currentDrag.nodeId, user.localFriendsList);
                            renderLists()      
                        } else {
                            removeFromLocalFriensList(currentDrag.nodeId)
                        }
                    }

                    currentDrag = null;
                }
            }
        })
    })
}

init();