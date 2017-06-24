/**
 * Created by Alexandru Ionut Budisteanu - SkyHub on 6/23/2017.
 * (C) BIT TECHNOLOGIES
 */

import FetchService from 'services/communication/FetchService'
import CookiesService from 'services/cookies/cookies.service';

export default {
    // ensure data for rendering given list type


    AUTHENTICATE_USER_BY_LOGIN: async({ commit, dispatch, state }, { sEmailUserName, sPassword }) => {

        await dispatch('AUTHENTICATE_LOGOUT_USER');

        if (state.user.isLoggedIn() === true) { console.log("user already logged in"); return {result:true, user:state.user} }; //already logged in

        let resData = await FetchService.sendRequestGetData("auth/login",{emailUsername:sEmailUserName, password:sPassword});

        console.log('Answer from Server Auth Login');
        console.log(resData);

        if(resData.result === true)
            await dispatch('AUTHENTICATE_USER_BY_PROVIDING_USER', {userJSON: resData.user, sessionId: resData.sessionId});

        return(resData);

    },

    // AUTHENTICATE_USER_BY_COOKIES: async ({ commit, dispatch, state }, { cookies }) => {
    //     let sessionId = CookiesService.extractAuthCookie(cookies); //extract only the sessionId
    //
    //     console.log("AUTHENTICATE_USER_BY_COOKIES cooooookies", cookies);
    //     if (sessionId !== null)
    //         return dispatch.commit('AUTHENTICATE_USER_BY_COOKIES', {sessionId: sessionId});
    // },

    AUTHENTICATE_USER_BY_SESSION: async ({ commit, dispatch, state }, { sessionId }) => {

        if (state.user.isLoggedIn() === true) {     //already logged in
            return ( {result: true, user: state.user, sessionId: sessionId});
        }

        let resData = await FetchService.sendRequestGetData("auth/login-session", {sessionId: sessionId});

        console.log('Answer from Login sessionId Async', resData, state);

        if (resData.result === true) {
           await commit('SET_AUTHENTICATED_NEW_USER_JSON', {
                newUserData: resData.user,
                sessionId: sessionId
            });
        }

        return resData;
    },

    AUTHENTICATE_USER_BY_PROVIDING_USER:  async ({ commit, dispatch, state }, { userJSON, sessionId }) => {

        CookiesService.setCookie('sessionId', sessionId, 365*5, '/');
        console.log('setting cookie   '+sessionId);

        return await commit('SET_AUTHENTICATED_NEW_USER_JSON',{ newUserData: userJSON, sessionId: sessionId });

    },


    AUTHENTICATE_LOGOUT_USER: async({ commit, dispatch, state }, { }) => {

        console.log("LOGOUT");

        FetchService.sendRequestGetData("auth/logout",{});

        CookiesService.deleteCookie("sessionId");
        return commit('SET_USER_LOGOUT');

    },


    AUTHENTICATE_REGISTER: async ({ commit, dispatch, state }, { userJSON, sessionId }) => {

        //Using Promise
        let resData = await FetchService.sendRequestGetData("auth/register", {
            email: sEmailAddress,
            username: sUsername,
            password: sPassword,
            firstName: sFirstName,
            lastName: sLastName,
            country: sCountry,
            language: sLanguage,
            city: sCity,
            latitude: sLatitude,
            longitude: sLongitude,
            timeZone: iTimeZone
        });

        console.log('Answer from Server Auth Register', resData);

        if (resData.result === true) {
            await dispatch('AUTHENTICATE_USER_BY_LOGIN',{sEmailAddress:sEmailAddress, sPassword: sPassword});
        }

        return resData;

    },

    AUTHENTICATE_REGISTER: async ({ commit, dispatch, state }, { userJSON, sessionId }) => {

        let resData = await FetchService.sendRequestGetData("auth/register-oauth", {
            socialNetwork: sSocialNetworkName,
            socialNetworkId: sSocialNetworkId,
            accessToken: sAccessToken,
            email: sEmail,
            firstName: sFirstName,
            lastName: sLastName,
            profilePic: sProfilePic,
            coverPic: sCoverImage,
            country: sCountryCode,
            language: sLanguage,
            city: sCity,
            latitude: latitude,
            longitude: longitude,
            shortBio: sShortBio,
            age: iAge,
            gender: sGender,
            timeZone: iTimeZone,
            verified: bVerified,
        });

        console.log('Answer from Oauth', resData);

        if (resData.result === true) {
            await dispatch('AUTHENTICATE_USER_BY_PROVIDING_USER',{userJSON: resData.user, sessionId: resData.sessionId});
        }

        return resData;

    },




}
