import './styles/styles.scss';
import renderFriendsFn from './../friend.hbs';

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
        return callAPI('friends.get', { fields: 'photo_50' })
    })
    .then((friends) => {
        const html = renderFriendsFn({ items: friends.items })
        const results = document.querySelector('.search-content__list--friend');

        results.innerHTML = html;
    })