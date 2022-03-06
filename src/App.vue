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
                                    <p class="title is-4">{{ order.doctor.name }}</p>
                                    <p class="subtitle is-6">{{ order.doctor.specialty }}</p>
                                </div>
                            </div>

                            <div class="content" v-if="stage==1">

                                <div class="notification is-info" v-show="error_fields.has('contract-exists')">
                                    <div class="block">
                                        Похоже, у Вас уже есть активная консультация с выбранным врачом. Чтобы продлить,
                                        попросите об этом врача в чате.
                                    </div>

                                    <div class="block">
                                        <strong><a href="https://medsenger.ru">Вход в Medsenger</a></strong>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Номер телефона</label>
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
                                    <label class="label">Промокод</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('promocode')" class="input"
                                               :class="{'is-danger': error_fields.has('promocode')}"
                                               type="text" v-model="order.promocode">
                                        <span class="icon is-small is-left"><i class="fa-solid fa-percent"></i></span>
                                    </div>

                                    <p class="help is-danger" v-show="error_fields.has('promocode')">Промокод не
                                        найден</p>

                                </div>

                                <div class="field">
                                    <div class="control">
                                        <label class="checkbox">
                                            <input type="checkbox" v-model="order.consent">
                                            Согласен с <a href="#">условиями предоставления услуг</a>
                                        </label>
                                    </div>
                                </div>

                                <div class="block has-text-centered">
                                    <img src="@/assets/logo.jpeg" style="width: 150px;"/>
                                </div>

                                <div class="field has-text-centered">
                                    <div class="control">
                                        <button class="button is-link" :class="{'is-loading': is_loading}"
                                                @click="next()">
                                            Проконсультироваться
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
                                        <strong><a href="#" @click="stage = 1">Неправильный номер?</a></strong>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Код подтверждения</label>
                                    <div class="control has-icons-left">
                                        <input @input="clearError('code')" class="input"
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

                                    <p class="help is-danger" v-show="error_fields.has('general')">Ошибка загрузки,
                                        пожалуйста свяжитесь с нами по адресу support@medsenger.ru</p>

                                </div>

                                <div class="field has-text-centered">
                                    <div class="control">
                                        <button class="button is-link" :class="{'is-loading': is_loading}"
                                                @click="next()">
                                            Проверить
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="content" v-if="stage==3">
                                <div class="notification is-warning">
                                    После завершения оплаты, обязательно нажмите на кнопку <strong>Вернуться на сайт</strong>!
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
                                        <span v-if="order.type == 'consulting'">2 недели</span>
                                        <span v-else>3 дня</span>
                                    </div>
                                </div>
                                <div class="block">
                                    <div class="field">
                                        <button class="button is-link" @click="pay()">Оплатить</button>
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
            endpoint: "http://localhost:8000/api/",
            stage: 0,
            is_loading: false,
            error_fields: new Set(),
            dc_id: 1,
            order: {
                consent: false,
                phone: ""
            },
            ipay: window.IPAY
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
        pay: function () {
            let sberpay = window.PAYF

            sberpay({
                    amount: this.order.price,
                    currency: 'RUB',
                    order_number: this.order.id,
                    description: 'Консультация врача ' +this.order.doctor.name + ' в Цифровой Клинике'
                },
                async (answer) => {
                    let result = await axios.post(this.endpoint + "digital_clinic/order/pay", {doctor_id: this.order.doctor.id, phone: this.order.phone, sber_answer: answer})

                    if (result.status != 200) {
                        this.general_error(result)
                    }
                    else {
                        if (this.order.user_exists) {
                            this.stage = 6
                        }
                        else {
                            this.stage = 5
                        }
                    }
                },
                (order) => {
                    console.log(order)
                })
        },
        phoneCorrect: function () {
            return this.order.phone && this.preparedPhone.length == 12;
        },
        codeCorrect: function () {
            return this.order.code && this.order.code.length == 4;
        },
        clearError: function (field) {
            this.error_fields.delete(field)
        },
        validate: async function () {
            this.error_fields.delete('contract-exists')
            this.error_fields.delete('general')

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

            return this.error_fields.size == 0
        },
        next: async function () {
            if (!(await this.validate())) {
                return;
            }

            this.is_loading = true;

            if (this.stage == 1) {

                let result = await axios.post(this.endpoint + "digital_clinic/phone/check", {
                    phone: this.preparedPhone,
                    doctor_id: this.order.doctor.id
                })

                if (result.status != 200) {
                    this.general_error(result)
                } else {

                    if (result.data.status == 'ok') {
                        console.log("here", result)

                        this.error_fields.delete('contract-exists');
                        this.order.user_exists = result.data.found

                        let verify_result = await axios.post(this.endpoint + "digital_clinic/phone/code", {phone: this.preparedPhone})

                        if (verify_result.status != 200) {
                            this.general_error(verify_result)
                        } else {
                            this.stage = 2
                            this.is_loading = false
                            return;
                        }

                    } else {
                        this.error_fields.add('contract-exists')
                        this.is_loading = false
                    }
                }

            }

            if (this.stage == 2) {
                axios.post(this.endpoint + "digital_clinic/phone/verify", {
                    phone: this.preparedPhone,
                    code: this.order.code
                }).then(this.process_answer).catch(this.general_error)
                return;
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

                    let result = await axios.post(this.endpoint + "digital_clinic/order/create", {
                        phone: this.preparedPhone,
                        code: this.order.code,
                        doctor_id: this.order.doctor.id,
                        promocode: this.promocode,
                        type: this.order.type
                    })

                    this.is_loading = false;

                    if (result.status == 200) {
                        if (result.data.status == 'ok') {
                            if (result.data.state == 'paid') {
                                this.stage = 4
                                return
                            } else {
                                this.stage = 3
                                this.order.price = result.data.price
                                this.order.id = result.data.order_id
                                return
                            }
                        }
                    } else {
                        this.general_error(result)
                    }
                }

                if (answer.data.status == 'error') {
                    this.error_fields.add('code')
                    this.error_fields.add('incorrect-code')
                }
            }
        }
    },
    mounted() {
        let doctor_id = parseInt(window.location.pathname.replace('/doctor/', ''));

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


                    if (answer.data.opinion_enabled && opinion_doctors.length != 0) {
                        this.order.type = 'opinion'
                        this.order.doctor = opinion_doctors[0];
                        this.stage = 1
                    } else if (answer.data.consulting_enabled && consulting_doctors.length != 0) {
                        this.order.type = 'consulting'
                        this.order.doctor = consulting_doctors[0]
                        this.stage = 1
                        this.doctor_id = doctor_id
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


/* generated by https://loading.io/ */


</style>
