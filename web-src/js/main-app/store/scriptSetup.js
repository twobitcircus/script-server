import Vue from 'vue';
import {forEachKeyValue, isEmptyObject, isEmptyString, isNull} from '../../common';

export default {
    namespaced: true,
    state: {
        parameterValues: {},
        errors: {}
    },
    actions: {
        reset({commit, dispatch}) {
            commit('SET_ERRORS', {});
            commit('SET_VALUES', {});
            dispatch('scriptConfig/setForcedAllowedValues', {}, {root: true})
        },

        initFromParameters({state, dispatch, commit}, {parameters}) {
            if (!isEmptyObject(state.parameterValues)) {
                for (const parameter of parameters) {
                    const parameterName = parameter.name;
                    if (!state.parameterValues.hasOwnProperty(parameterName)) {
                        let value;
                        if (!isNull(parameter.default)) {
                            value = parameter.default;
                        } else {
                            value = null;
                        }

                        dispatch('setParameterValue', {parameterName, value});
                    }
                }

                return;
            }

            const values = {};
            for (const parameter of parameters) {
                if (!isNull(parameter.default)) {
                    values[parameter.name] = parameter.default;
                } else {
                    values[parameter.name] = null;
                }
            }

            dispatch('_setParameterValues', values);
        },

        setParameterValue({state, commit, dispatch}, {parameterName, value}) {
            commit('UPDATE_SINGLE_VALUE', {parameterName, value});
            dispatch('sendValueToServer', {parameterName, valueToSend: value});
        },

        setParameterError({commit}, {parameterName, errorMessage}) {
            commit('UPDATE_PARAMETER_ERROR', {parameterName, errorMessage})
        },

        setParameterValues({state, rootState, commit, dispatch}, {values, forceAllowedValues}) {
            dispatch('_setParameterValues', values);

            const forcedAllowedValues = forceAllowedValues ? values : {};
            dispatch('scriptConfig/setForcedAllowedValues', forcedAllowedValues, {root: true});
        },

        _setParameterValues({state, rootState, commit, dispatch}, values) {
            commit('SET_VALUES', values);

            forEachKeyValue(values, (parameterName, valueToSend) => dispatch('sendValueToServer', {
                parameterName,
                valueToSend
            }));
        },

        sendValueToServer({state, commit, dispatch}, {parameterName, valueToSend}) {
            dispatch('scriptConfig/sendParameterValue', {parameterName, value: valueToSend}, {root: true});
        }
    },
    mutations: {
        SET_VALUES(state, values) {
            state.parameterValues = values;
        },
        SET_ERRORS(state, errors) {
            state.errors = errors;
        },
        UPDATE_SINGLE_VALUE(state, {parameterName, value}) {
            Vue.set(state.parameterValues, parameterName, value);
        },
        UPDATE_PARAMETER_ERROR(state, {parameterName, errorMessage}) {
            if (isEmptyString(errorMessage)) {
                delete state.errors[parameterName];
            } else {
                state.errors[parameterName] = errorMessage;
            }
        }
    }
}