//блокировка/разблокировка скрола

const disableScroll = () => {
    //когда убираем скрол, страница становится шире, чтобы небыло горизонтального скачка
    //получаем ширину скрола и добавим отступ
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    //Запоминаем место страницы до которого пользователь дошел
    document.body.scrollPosition = window.scrollY; //свойства scrollPosition в браузере нет, мы его сами создаём

    //такой код необходимо прописывать чтобы была поддержка IPhone т.к. они не поддерживают свойство overFlow:hidden;
    document.body.style.cssText = `
        overFlow:hidden;
        position: fixed;
        top: -${document.body.scrollPosition}px;
        left: 0;
        height: 100vh;
        width: 100vw;
        padding-right: ${widthScroll}px;
    `
}

const enableScroll = () => {
    document.body.style.cssText = 'position: relative';//свойство position: relative' можно и не прописывать но могут возникнуть различные глюки
    //возвращаем пользователя на место
    window.scroll({top:document.body.scrollPosition});//свойство принимает объект который мы и передаём
}



{ //модальное окно
    const presentOrderBtn = document.querySelector('.present__order-btn');
    const pageOverlayModal = document.querySelector('.page__overlay_modal');
    const modalClose = document.querySelector('.modal__close');


    //универсальная функция которая открывает модальные окна
    const handlerModal = (openBtn, modal, openSelector, closeTrigger, speedClose) => {

        let opacity = 0;

        const speed = {
            slow: 15,
            medium: 8,
            fast: 1, 
            default: 5
        };

        const openModal = () => { //функция открытия модального окна
            disableScroll();
            //для анимации открытия модального окна 
            modal.style.opacity = opacity;

            modal.classList.add(openSelector);

            const timer = setInterval(() => {
                opacity += 0.02;
                modal.style.opacity = opacity;
                if (opacity >= 1) clearInterval(timer)
            }, speed[speedClose] ? speed[speedClose] : speed.default);
        }


        const closeModal = () => { //функция закрытия модального окна
            
            const timer = setInterval(() => {
                opacity -= 0.02;
                modal.style.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(timer)
                    modal.classList.remove(openSelector);
                    enableScroll();
                }
            }, speed[speedClose] ? speed[speedClose] : speed.default);
        }

        openBtn.addEventListener('click', openModal);
        closeTrigger.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => { //закрытие модального окна по клику на заливку
            if (e.target === modal) { //проверяет на какой элемент был клик
                closeModal();
            }

        })
    };

    handlerModal(
        presentOrderBtn, 
        pageOverlayModal, 
        'page__overlay_modal_open', 
        modalClose, 'slow'
        );
}

{ // Бургер меню

    const headerContacts = document.querySelector('.header__contacts');
    const headerContactsBurger = document.querySelector('.header__contacts-burger');

    const handlerBurger = (openBtn, menu, openSelector) => {
        openBtn.addEventListener('click', () => {

            if (menu.classList.contains(openSelector)) {
                menu.style.height = '';
                menu.classList.remove(openSelector);
            } else {
                //определяем высоту меню
                menu.style.height = menu.scrollHeight + 'px';
                menu.classList.add(openSelector);
            }

        })
    };

    handlerBurger(headerContactsBurger, headerContacts, 'header__contacts_open');
}

{ //Галерея

    const portfolioList = document.querySelector('.portfolio__list');
    const pageOverlay = document.createElement('div');
    pageOverlay.classList.add('page__overlay')

    portfolioList.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if(card) {
            disableScroll();
            document.body.append(pageOverlay); //добавляем заливку

            const title = card.querySelector('.card__client');//для атрибуда alt получаем текст

            const picture = document.createElement('picture');
                    picture.style.cssText = `
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 1440px 
                `;

        picture.innerHTML = `
            <source srcset="${card.dataset.fullImage}.avif" type="image/avif">
            <source srcset="${card.dataset.fullImage}.webp" type="image/webp">
            <img src="${card.dataset.fullImage}.jpg" alt="${title.textContent}">
        `

        pageOverlay.append(picture);

        }
    });

    pageOverlay.addEventListener('click', () => {
        pageOverlay.remove(); //удаляем созданный элемент. Визуально это как закрытие
        pageOverlay.textContent = ''; //очищаем элемент, чтобы не было наложения эл-в
        enableScroll();
    })


}

{ //создание карточек на основе JSON
    const portfolioList = document.querySelector('.portfolio__list');
    const portfolioAdd = document.querySelector('.portfolio__add');
    const COUNT_CARD = 2;

    const getData = () => fetch('db.json')
            .then((response) => {
                if (response.ok === true) {
                    return response.json()
                } else {
                    throw `Что-то пошло не так, попробуйте позже ошибка : ${response.status}`
                }
            })
            .catch(error => console.log(error));

    const createStore = async () => {
        const data = await getData();

        return {
            data,
            counter: 0,
            count: COUNT_CARD,
            get length() {
                return this.data.length;
            },
            get cardData() {
                const renderData = this.data.slice(this.counter, this.counter + this.count);
                this.counter += this.count
                return renderData;
            }
        }
    }

console.log(createStore());

    const renderCard = data => {
        const cards = data.map((item) => {
            const li = document.createElement('li');
            li.classList.add('portfolio__item');
            li.innerHTML = `
                <article class="card" tabindex="0" role="button" aria-label="открыть макет" data-full-image="img/db/iphone">
                    <picture class="card__picture">
                    <source srcset="${item.preview}.avif" type="image/avif">
                    <source srcset="${item.preview}.webp" type="image/webp">
                    <img src="${item.preview}.jpg" alt="превью iphone" width="166" height="103">
                    </picture>

                    <p class="card__data">
                    <span class="card__client">Клиент: Full Apple</span>
                    <time class="card__date" datetime="2021">год: 2021</time>
                    </p>

                    <h3 class="card__title">Landing-page</h3>
                </article>
            `
            return li;
        })

        portfolioList.append(...cards)
    };

    //главная ф-я которая всё возвращает
    const initPortfolio = async () => {
        const store = await createStore();
        renderCard(store.cardData);
        portfolioAdd.addEventListener('click', () => {
            renderCard(store.cardData);

            console.log(store.counter);
            console.log(store.data.length);

            if (store.length === store.counter) {
                console.log(store.counter);
                portfolioAdd.remove();
            }
        });
    }

    initPortfolio();
}

