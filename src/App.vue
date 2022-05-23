<template>
    <div class="container">

        <div class="columns is-centered">
            <div class="column is-12 main-block">
                <div class="card">
                    <div class="card-content">
                        <div v-if="stage > 0">
                            <div class="media">
                                <div class="media-left">
                                    <figure class="image is-64x64">
                                        <img class="is-rounded"
                                             :src="endpoint + 'digital_clinic/doctor/' + order.doctor.id + '/photo'">
                                    </figure>
                                </div>
                                <div class="media-content has-text-left">
                                    <p class="title is-4"><a :href="order.doctor.info_url" target="_blank" v-if="order.doctor.info_url">{{ order.doctor.name }}</a><span v-else>{{ order.doctor.name }}</span></p>
                                    <p class="subtitle is-6">{{ order.doctor.specialty }}</p>
                                </div>
                            </div>

                            <div class="content" v-if="stage==1">
                                <div class="notification" v-show="!error_fields.has('contract-exists') && order.doctor.description">
                                    <div class="block is-size-7" v-html="order.doctor.description"></div>
                                </div>

                                <div class="notification is-info" v-show="error_fields.has('contract-exists')">
                                    <div class="block">
                                        Похоже, у Вас уже есть активная консультация с выбранным врачом. Чтобы продлить,
                                        попросите об этом врача в чате.
                                    </div>

                                    <div class="block">
                                        <strong><a href="https://medsenger.ru">Вход в Medsenger</a></strong>
                                    </div>
                                </div>

                                <div class="block">
                                    <label class="label">Стоимость консультации</label>
                                    <div class="control">
                                        {{ order.doctor.dc_price * order.doctor.minimum_days }} (руб.)
                                    </div>
                                </div>

                                <div class="block">

                                    <label class="label">Длительность консультации</label>
                                    <div class="control">
                                        {{ order.doctor.minimum_days }} (дней)
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label required">Номер телефона</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('phone')" class="input"
                                               :class="{'is-success': phoneCorrect(), 'is-danger': error_fields.has('phone')}"
                                               type="tel" placeholder="+7 (111) 111-11-11"
                                               v-mask="'+7 (###) ###-##-##'" v-model="order.phone">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-phone"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('phone')">Укажите номер
                                        телефона</p>

                                </div>

                                <div class="field">
                                    <div class="control">
                                        <label class="checkbox">
                                            <input type="checkbox" v-model="order.consent">
                                            Согласие с <strong>условиями предоставления услуг</strong>
                                        </label>

                                        <ul class="has-text-left" style="font-size: 0.9rem;">
                                            <li v-for="template in templates" v-bind:key="template.id"><a :href="endpoint + 'client/template/' + template.id" target="_blank">{{ template.name }}</a></li>
                                            <li v-if="order.doctor.dc_oferta_url"><a :href="order.doctor.dc_oferta_url" target="_blank">Соглашение (оферта) об оказании информационных услуг {{ order.doctor.name }}</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <img src="@/assets/logo.jpeg" style="width: 150px;"/>
                                </div>

                                <div class="field has-text-centered">
                                    <div class="control">
                                        <button class="button is-link" :class="{'is-loading': is_loading}"
                                                @click="next()">
                                            Обратиться
                                        </button>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <p class="help is-danger" v-show="error_fields.has('consent')">Необходимо согласие с
                                        условиями.</p>
                                    <p class="help is-danger" v-show="error_fields.has('general')">Ошибка загрузки,
                                        пожалуйста свяжитесь с нами по адресу support@medsenger.ru</p>
                                </div>

                            </div>

                            <div class="content" v-if="stage==2">

                                <div class="notification is-info">
                                    <button class="delete"></button>
                                    <div class="block">
                                        Мы отправили Вам SMS с кодом на номер
                                        <strong>{{ order.phone }}</strong>. Пожалуйста, проверьте сообщения и введите
                                        код.
                                    </div>

                                    <div class="block" v-if="order.user_exists">
                                        Мы нашли аккаунт Medsegner, связанный с этим номером телефона. Заного вводить
                                        данные не потребуется.
                                    </div>

                                    <div class="block">
                                        <strong><a href="#" @click="stage = 1">Не получили SMS?</a></strong>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Код подтверждения</label>
                                    <div class="control has-icons-left">
                                        <input @input="checkCode()" class="input"
                                               :class="{'is-success': codeCorrect(), 'is-danger': error_fields.has('code')}"
                                               type="tel" placeholder="1234"
                                               v-mask="'####'" v-model="order.code">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-lock"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('empty-code')">Введите код из
                                        SMS.</p>

                                    <p class="help is-danger" v-show="error_fields.has('incorrect-code')">Код не
                                        совпадает с
                                        отправленным.</p>

                                </div>

                                <div class="field has-text-centered">
                                    <div class="control">
                                        <button class="button is-link" :class="{'is-loading': is_loading}"
                                                @click="next()">
                                            Проверить
                                        </button>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <p class="help is-danger" v-show="error_fields.has('general')">Ошибка загрузки,
                                        пожалуйста свяжитесь с нами по адресу support@medsenger.ru</p>
                                </div>
                            </div>

                            <div class="content" v-if="stage==3">
                                <div class="notification is-warning">
                                    После завершения оплаты, обязательно нажмите на кнопку <strong>Вернуться на
                                    сайт</strong>!
                                </div>

                                <div class="block">
                                    <label class="label">Стоимость консультации</label>
                                    <div class="control">
                                        {{ this.order.price }} (руб.)
                                    </div>
                                </div>

                                <div class="block">

                                    <label class="label">Длительность консультации</label>
                                    <div class="control">
                                        {{ this.order.days }} (дней)
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Промокод</label>
                                    <div class="control has-icons-left">
                                        <input @input="checkPromocode('promocode')" class="input"
                                               :class="{'is-danger': error_fields.has('promocode'), 'is-success': promocode_valid}"
                                               type="text" v-model="order.promocode">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-percent"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('promocode')">Промокод не
                                        найден</p>

                                    <p class="help">Укажите, если есть.</p>

                                </div>

                                <div class="block">
                                    <div class="field">
                                        <button class="button is-link" @click="pay()" :disabled="sberpay == undefined">Оплатить</button>

                                        <p class="help" v-if="sberpay == undefined">На данным момент оплата консультации доступна только на территории России. Если вы используете VPN, отключите его и обновите страницу.</p>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <p class="help is-danger" v-show="error_fields.has('general')">Ошибка загрузки,
                                        пожалуйста свяжитесь с нами по адресу support@medsenger.ru</p>
                                </div>

                                <div class="block is-size-7 has-text-grey-light has-text-left">
                                    <p>Оплата происходит через ПАО СБЕРБАНК с использованием банковских карт следующих платёжных систем:</p>
                                    <p class="has-text-centered"><img class="mx-1" style="height: 15px;" src="@/assets/mir.png"/><img class="mx-1" style="height: 15px;" src="@/assets/visa.png"/>
                                        <img style="height: 15px;" class="mx-1" src="@/assets/mastercard.png"/><img class="mx-1" style="height: 15px;" src="@/assets/jcb.png"/></p>
                                    <p>Для оплаты (ввода реквизитов Вашей карты) Вы будете перенаправлены на платёжный шлюз ПАО СБЕРБАНК. Соединение с
                                        платёжным шлюзом и передача информации осуществляется в защищённом режиме с использованием протокола
                                        шифрования SSL. В случае если Ваш банк поддерживает технологию безопасного проведения интернет-платежей
                                        Verified By Visa, MasterCard SecureCode, MIR Accept, J-Secure, для проведения платежа также может
                                        потребоваться ввод специального пароля.</p>

                                    <p>Настоящий сайт поддерживает 256-битное шифрование. Конфиденциальность сообщаемой персональной информации
                                        обеспечивается ПАО СБЕРБАНК. Введённая информация не будет предоставлена третьим лицам за исключением случаев,
                                        предусмотренных законодательством РФ. Проведение платежей по банковским картам осуществляется в строгом
                                        соответствии с требованиями платёжных систем МИР, Visa Int., MasterCard Europe Sprl, JCB.</p>

                                </div>
                            </div>

                            <div class="content" v-if="stage==4">

                                <div class="notification is-info" v-show="error_fields.has('contract-exists')">
                                    <div class="block">
                                        Отлично, Ваша консультация оплачена, осталось только создать аккаунт в
                                        Medsenger. Логином будет Ваш номер телефона.
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label required">Придумайте пароль</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('password')" class="input"
                                               :class="{'is-success': passwordCorrect(), 'is-danger': error_fields.has('password')}"
                                               type="password"
                                               v-model="order.password">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-key"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('password')">Укажите пароль, как
                                        минимум 6 символов</p>

                                </div>

                                <div class="field">
                                    <label class="label required">Повторите пароль</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('password_confirm')" class="input"
                                               :class="{'is-success': passwordConfirmed(), 'is-danger': error_fields.has('password-confirm')}"
                                               type="password" v-model="order.password_confirm">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-key"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('password-confirm')">Пароли не
                                        совпадают</p>

                                </div>

                                <div class="field">
                                    <label class="label required">ФИО</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('name')" class="input"
                                               :class="{'is-success': filled('name'), 'is-danger': error_fields.has('name')}"
                                               type="text" placeholder="Фамилия Имя Отчество"
                                               v-model="order.name">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-person"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('name')">Укажите как вас
                                        зовут</p>

                                </div>

                                <div class="columns">
                                    <div class="column is-7">
                                        <div class="field">
                                            <label class="label required">Дата рождения</label>
                                            <div class="control has-icons-left">
                                                <input @input="clearError('birthday')" class="input"
                                                       :class="{'is-success': birthdayCorrect(), 'is-danger': error_fields.has('birthday')}"
                                                       type="tel" placeholder="30.12.1970"
                                                       v-mask="'##.##.####'" v-model="order.birthday">
                                                <span class="icon is-small is-left"><i
                                                        class="fa-solid fa-calendar-day"></i></span>
                                            </div>

                                            <p class="help is-danger" v-show="error_fields.has('birthday')">Укажите дату
                                                рождения</p>

                                        </div>
                                    </div>

                                    <div class="column is-5">
                                        <div class="field">
                                            <label class="label required">Пол</label>
                                            <div class="control">
                                                <div class="select">
                                                    <select v-model="order.sex">
                                                        <option value="male" selected>Мужской</option>
                                                        <option value="female">Женский</option>
                                                    </select>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>


                                <div class="field has-text-centered">
                                    <div class="control">
                                        <button class="button is-link" :class="{'is-loading': is_loading}"
                                                @click="next()">
                                            Завершение регистрации
                                        </button>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <p class="help is-danger" v-show="error_fields.has('general')">Ошибка загрузки,
                                        пожалуйста свяжитесь с нами по адресу support@medsenger.ru</p>
                                </div>
                            </div>

                            <div class="content" v-if="stage==5">
                                <div class="notification is-success">
                                    <strong>Ваша консультация открыта!</strong> Скачайте мобильное приложение или используйте веб-браузер.
                                </div>

                                <div class="field">
                                    <label class="label">Логин</label>
                                    <div class="control">
                                        {{ preparedPhone }}
                                    </div>
                                </div>
                                <div class="block">
                                    <div class="field">

                                        <label class="label">Пароль</label>
                                        <div class="control">
                                            Указанный при регистрации
                                        </div>
                                    </div>
                                </div>
                                <div class="block">
                                    <div class="columns is-mobile">
                                        <div class="column is-half is-6-mobile" style="padding: 0;">
                                            <a data-ng-if="clients=='doctors'"
                                               href="https://play.google.com/store/apps/details?id=ru.medsenger.patient"
                                               target="_blank"><img src="https://medsenger.ru/images/google-play-badge.png"
                                                                    class="h-50" alt=""/></a>
                                        </div>
                                        <div class="column is-half is-6-mobile" style="padding: 0;">
                                            <a data-ng-if="clients=='doctors'" href="https://appsto.re/ru/nOT_fb.i" target="_blank"><img
                                                    src="https://medsenger.ru/images/appstore-badge.png" class="h-50" alt=""/></a>
                                        </div>
                                    </div>

                                    <div class="field">
                                        <a class="button is-medium is-fullwidth" href="https://medsenger.ru">Веб-версия</a>
                                    </div>
                                </div>
                                <div class="block">
                                    <div class="notification is-info">
                                        <p>P.S. Чтобы получать уведомления об ответах врача по электронной почте, Вы
                                            можете указать <strong>email</strong> в настройках.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div v-else>
                            <div v-if="hasGeneralError">
                                <h3 style="margin: 50px 0;">К сожалению, запись к выбранному врачу недоступна.</h3>
                            </div>
                            <div v-else>
                                <div class="loadingio-spinner-rolling-u2nzfi10uv">
                                    <div class="ldio-uehm5tnikn">
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import {mask} from 'vue-the-mask'
    import axios from 'axios';

    export default {
        name: 'App',
        components: {},
        directives: {mask},
        data() {
            return {
                endpoint: "https://medsenger.ru/api/",
                stage: 0,
                is_loading: false,
                error_fields: new Set(),
                dc_id: 947,
                order: {
                    consent: false,
                    phone: "",
                    sex: "male"
                },
                ipay: window.IPAY,
                templates: []
            }
        },
        computed: {
            preparedPhone: function () {
                return '+' + this.order.phone.replace(/[^\d]/g, "");
            },
            hasGeneralError: function () {
                return this.error_fields.has('general');
            }
        },
        methods: {
            sberpay: window.PAYF,
            pay: function () {

                this.sberpay({
                        amount: this.order.price,
                        currency: 'RUB',
                        order_number: this.order.id,
                        description: 'Добровольное пожертвование на ведение уставной деятельности Ассоциации НБМЗ'
                    },
                    async (answer) => {
                        try {
                            await axios.post(this.endpoint + "digital_clinic/order/pay", {
                                doctor_id: this.order.doctor.id,
                                phone: this.order.phone,
                                sber_answer: answer
                            })

                            if (this.order.user_exists) {
                                this.finishOrder()
                            } else {
                                this.stage = 4
                            }
                        } catch (error) {
                            this.general_error(error)
                        }

                        this.is_loading = false;
                    },
                    (order) => {
                        console.log(order)
                    })
            },
            finishOrder: async function () {
                try {
                    let result = await axios.post(this.endpoint + "digital_clinic/order/finish", {
                        doctor_id: this.order.doctor.id,
                        phone: this.order.phone,
                        promocode: this.order.promocode,
                        name: this.order.name,
                        birthday: this.order.birthday,
                        sex: this.order.sex,
                        code: this.order.code,
                        type: this.order.type,
                        password: this.order.password
                    })


                    if (result.data.status != "ok") {
                        this.general_error(result)
                    } else {
                        this.stage = 5
                    }
                } catch (e) {
                    this.general_error(e)
                }
            },
            passwordCorrect: function () {
                return this.order.password && this.order.password.length > 5
            },
            passwordConfirmed: function () {
                return this.order.password && this.order.password == this.order.password_confirm
            },
            phoneCorrect: function () {
                return this.order.phone && this.preparedPhone.length == 12;
            },
            birthdayCorrect: function () {
                let birthday = this.order.birthday

                if (!birthday) {
                    return false
                }

                let regexVar = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/;
                let regexVarTest = regexVar.test(birthday);
                let userBirthDate = new Date(birthday.replace(regexVar, "$3-$2-$1"));

                console.log(regexVar, regexVarTest, userBirthDate)

                if (!regexVarTest) { // Test this before the other tests
                    return false
                } else if (isNaN(userBirthDate)) {
                    return false
                }

                return true
            },
            codeCorrect: function () {
                return this.order.code && this.order.code.length == 4;
            },
            filled: function (field) {
                return this.order[field] && this.order[field].length > 0
            },
            clearError: function (field) {
                this.error_fields.delete(field)
            },
            checkPromocode: function () {
                this.promocode_valid = false

                axios.post(this.endpoint + "digital_clinic/promocode/apply", {
                    phone: this.preparedPhone,
                    code: this.order.code,
                    doctor_id: this.order.doctor.id,
                    promocode: this.order.promocode,
                    type: this.order.type
                }).then((result) => {
                    if (result.data.status == 'error') {
                        this.error_fields.add('promocode')
                    } else {
                        this.promocode_valid = true
                        this.error_fields.delete('promocode')

                        if (result.data.state == 'paid') {
                            if (this.order.user_exists) {
                                this.finishOrder()
                            } else {
                                this.stage = 4
                                this.is_loading = false
                            }
                            return
                        } else {
                            this.order.price = result.data.price
                        }
                    }
                })
            },
            validate: async function () {
                this.error_fields.delete('contract-exists')
                this.error_fields.delete('general')
                this.error_fields.delete('promocode')

                if (this.stage == 1) {
                    if (this.order.promocode) {
                        let result = await axios.post(this.endpoint + "digital_clinic/promocode/check", {promocode: this.order.promocode})

                        if (result.data.status == 'error') {
                            this.error_fields.add('promocode')
                        } else {
                            this.error_fields.delete('promocode')
                        }
                    } else {
                        this.error_fields.delete('promocode')
                    }

                    if (!this.phoneCorrect()) {
                        this.error_fields.add('phone')
                    } else {
                        this.error_fields.delete('phone')
                    }

                    if (!this.order.consent) {
                        this.error_fields.add('consent')
                    } else {
                        this.error_fields.delete('consent')
                    }
                }

                if (this.stage == 2) {
                    this.error_fields.delete('incorrect-code')
                    this.error_fields.delete('general')

                    if (!this.codeCorrect()) {
                        this.error_fields.add('code')
                        this.error_fields.add('empty-code')
                    } else {
                        this.error_fields.delete('code')
                        this.error_fields.delete('empty-code')
                    }
                }

                if (this.stage == 4) {
                    if (!this.filled('name')) {
                        this.error_fields.add('name')
                    } else {
                        this.error_fields.delete('name')
                    }

                    if (!this.birthdayCorrect()) {
                        this.error_fields.add('birthday')
                    } else {
                        this.error_fields.delete('birthday')
                    }

                    if (!this.passwordCorrect()) {
                        this.error_fields.add('password')
                    } else {
                        this.error_fields.delete('password')
                    }

                    if (!this.passwordConfirmed()) {
                        this.error_fields.add('password-confirm')
                    } else {
                        this.error_fields.delete('password-confirm')
                    }
                }

                return this.error_fields.size == 0
            },
            next: async function () {
                if (!(await this.validate())) {
                    return;
                }

                this.is_loading = true;

                if (this.stage == 1) {
                    try {
                        let result = await axios.post(this.endpoint + "digital_clinic/phone/check", {
                            phone: this.preparedPhone,
                            doctor_id: this.order.doctor.id
                        })


                        if (result.data.status == 'ok') {
                            console.log("here", result)

                            this.error_fields.delete('contract-exists');
                            this.order.user_exists = result.data.found

                            try {
                                await axios.post(this.endpoint + "digital_clinic/phone/code", {phone: this.preparedPhone})

                                this.stage = 2
                                this.is_loading = false
                                return;
                            } catch (e) {
                                this.general_error(e)
                                return
                            }
                        } else {
                            this.error_fields.add('contract-exists')
                            this.is_loading = false
                        }
                    } catch (e) {
                        this.general_error(e)
                    }
                }

                if (this.stage == 2) {
                    axios.post(this.endpoint + "digital_clinic/phone/verify", {
                        phone: this.preparedPhone,
                        code: this.order.code
                    }).then(this.process_answer).catch(this.general_error)
                    return;
                }

                if (this.stage == 4) {
                    this.finishOrder()
                }
            },
            general_error: function (error) {
                this.is_loading = false;
                console.log(error);
                this.error_fields.add('general')
            },
            process_answer: async function (answer) {
                this.is_loading = false;

                console.log(answer)

                if (this.stage == 1) {
                    if (answer.data.status == 'ok') {
                        this.stage = 2
                        return
                    }
                }

                if (this.stage == 2) {
                    if (answer.data.status == 'ok') {
                        this.error_fields.delete('code')
                        this.error_fields.delete('incorrect-code')

                        this.is_loading = true;

                        try {
                            let result = await axios.post(this.endpoint + "digital_clinic/order/create", {
                                phone: this.preparedPhone,
                                code: this.order.code,
                                doctor_id: this.order.doctor.id,
                                promocode: this.order.promocode,
                                type: this.order.type
                            })

                            if (result.data.status == 'ok') {
                                if (result.data.state == 'paid') {
                                    if (this.order.user_exists) {
                                        this.finishOrder()
                                    } else {
                                        this.stage = 4
                                        this.is_loading = false
                                    }
                                    return
                                } else {
                                    this.stage = 3
                                    this.order.price = result.data.price
                                    this.order.days = result.data.days
                                    this.order.id = result.data.order_id
                                    this.is_loading = false
                                    return
                                }
                            }
                        } catch (e) {
                            this.general_error(e)
                        }

                        this.is_loading = false;
                    }

                    if (answer.data.status == 'error') {
                        this.error_fields.add('code')
                        this.error_fields.add('incorrect-code')
                    }
                }
            },
            checkCode: function () {
                this.clearError('code');
                if (this.order.code >= 1000) {
                    this.next()
                }
            }
        },
        mounted() {
            let url_parts = window.location.pathname.split('/')

            if (url_parts.length < 3)
            {
                this.error_fields.add('general')
                console.log('incorrect N parts')
                return;
            }

            let doctor_id = parseInt(url_parts[2])
            let type = url_parts[1]

            console.log('type is', type)

            if (!doctor_id) {
                this.error_fields.add('general')
                console.log('incorrect doctor id')
            } else {
                axios.get(this.endpoint + 'client/clinics/' + this.dc_id).then((data) => {
                    let answer = data.data;

                    console.log("got data", answer)

                    if (answer.status != "ok") {
                        this.error_fields.add('general')
                    } else {
                        let consulting_doctors = answer.data.consulting_doctors.filter((doctor) => {
                            return doctor.id == doctor_id
                        });
                        let opinion_doctors = answer.data.opinion_doctors.filter((doctor) => {
                            return doctor.id == doctor_id
                        });


                        if (answer.data.opinion_enabled && opinion_doctors.length != 0 && type == 'opinion') {
                            this.order.type = 'opinion'
                            this.order.doctor = opinion_doctors[0];
                            this.stage = 1
                            this.templates = answer.data.opinion_templates;
                        } else if (answer.data.consulting_enabled && consulting_doctors.length != 0 && type != 'opinion') {
                            this.order.type = 'consulting'
                            this.order.doctor = consulting_doctors[0]
                            this.stage = 1
                            this.doctor_id = doctor_id
                            this.templates = answer.data.consulting_templates;
                        } else {
                            this.error_fields.add('general')
                        }
                    }


                }).catch(() => {
                    this.error_fields.add('general')
                });
            }
        }
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    .container {
        min-height: 100vh;
        width: 100vw;
    }

    .main-block {
        max-width: 400px;
        margin: 0 auto;
    }

    .media-content {
        overflow-y: hidden;
    }

    .required:after {
        content: " *";
        color: red;
    }

</style>
