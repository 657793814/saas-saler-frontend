import {createStore} from 'vuex'

export default createStore({
    state: {
        token: '',
        randStr: ''
    },
    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
        },
        SET_RAND_STR(state, randStr) {
            state.randStr = randStr
        },
        CLEAR_AUTH_DATA(state) {
            state.token = ''
            state.randStr = ''
        }
    },
    actions: {
        setAuthData({commit}, {token, randStr}) {
            commit('SET_TOKEN', token)
            commit('SET_RAND_STR', randStr)
        },
        clearAuthData({commit}) {
            commit('CLEAR_AUTH_DATA')
        }
    },
    getters: {
        token: state => state.token,
        randStr: state => state.randStr
    }
})